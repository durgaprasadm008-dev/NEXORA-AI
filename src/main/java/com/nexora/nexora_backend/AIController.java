package com.nexora.nexora_backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    @PostMapping(
            value = "/chat",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public StreamingResponseBody chat(
            @RequestBody String message
    ) {

        return outputStream -> {

            HttpURLConnection connection = null;

            try {

                URL url =
                        new URL(
                                "http://localhost:11434/api/generate"
                        );


                connection =
                        (HttpURLConnection)
                                url.openConnection();


                connection.setRequestMethod(
                        "POST"
                );


                connection.setRequestProperty(
                        "Content-Type",
                        "application/json; charset=UTF-8"
                );


                connection.setDoOutput(true);

                connection.setConnectTimeout(
                        10000
                );

                connection.setReadTimeout(
                        600000
                );


                String systemPrompt = """
You are NEXORA AI.

You are an intelligent, student-friendly
digital assistant inside the NEXORA workspace.

Your job is to understand the user's request
and provide the most useful answer.

IMPORTANT RESPONSE RULES:

1. Understand the actual request first.

2. Keep answers focused.

3. Use simple natural English unless advanced
detail is requested.

4. Organize information clearly.

5. Use Markdown when useful.

6. Use ## headings only when they improve
readability.

7. Use numbered lists for procedures and steps.

8. Use bullet points for features and key points.

9. Use tables only when comparison is genuinely
useful.

10. Use bold text for important terms.

11. Give examples when useful.

12. Avoid unnecessary repetition.

13. Do not make answers longer just to appear
intelligent.

14. For programming questions, provide clean,
working and beginner-friendly code.

15. For mathematical problems, show the important
calculation steps.

16. For exam questions, focus on accurate,
easy-to-write answers.

17. If the user asks something unclear but a
reasonable interpretation exists, answer using
that interpretation.

18. Never claim to have performed an action that
you did not perform.

19. Never reveal or invent private internal
reasoning.

20. Prioritize:

CLARITY
ACCURACY
ORGANIZATION
USEFULNESS
BREVITY
""";


                String finalPrompt =
                        systemPrompt
                        + """

USER REQUEST:

"""
                        + message;


                String json =
                        objectMapper.writeValueAsString(
                                new OllamaRequest(
                                        "llama3.2:3b",
                                        finalPrompt,
                                        true,
                                        0.35,
                                        2048,
                                        600
                                )
                        );


                try (
                        OutputStream requestStream =
                                connection.getOutputStream()
                ) {

                    requestStream.write(
                            json.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

                    requestStream.flush();
                }


                int responseCode =
                        connection.getResponseCode();


                if (responseCode != 200) {

                    BufferedReader errorReader =
                            new BufferedReader(
                                    new InputStreamReader(
                                            connection.getErrorStream(),
                                            StandardCharsets.UTF_8
                                    )
                            );


                    StringBuilder error =
                            new StringBuilder();


                    String line;


                    while (
                            (line =
                                    errorReader.readLine())
                                    != null
                    ) {

                        error.append(line);
                    }


                    throw new RuntimeException(
                            "Ollama HTTP "
                            + responseCode
                            + ": "
                            + error
                    );
                }


                try (
                        BufferedReader reader =
                                new BufferedReader(
                                        new InputStreamReader(
                                                connection.getInputStream(),
                                                StandardCharsets.UTF_8
                                        )
                                )
                ) {

                    String line;


                    while (
                            (line =
                                    reader.readLine())
                                    != null
                    ) {

                        if (line.isBlank()) {
                            continue;
                        }


                        JsonNode node =
                                objectMapper.readTree(
                                        line
                                );


                        String response =
                                node.path(
                                        "response"
                                ).asText();


                        if (
                                !response.isEmpty()
                        ) {

                            outputStream.write(
                                    response.getBytes(
                                            StandardCharsets.UTF_8
                                    )
                            );


                            outputStream.flush();
                        }


                        if (
                                node.path(
                                        "done"
                                ).asBoolean()
                        ) {

                            break;
                        }
                    }
                }


            } catch (Exception e) {

                String errorMessage =
                        "\n\nNEXORA AI ERROR: "
                        + e.getMessage();


                outputStream.write(
                        errorMessage.getBytes(
                                StandardCharsets.UTF_8
                        )
                );


                outputStream.flush();


            } finally {

                if (connection != null) {

                    connection.disconnect();
                }
            }
        };
    }


    private record OllamaRequest(

            String model,

            String prompt,

            boolean stream,

            double temperature,

            int num_predict,

            int keep_alive

    ) {
    }
}