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

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(value = "/chat", produces = MediaType.TEXT_PLAIN_VALUE)
    public StreamingResponseBody chat(@RequestBody String message) {

        return outputStream -> {

            try {
                URL url = new URL("http://localhost:11434/api/generate");

                HttpURLConnection connection =
                        (HttpURLConnection) url.openConnection();

                connection.setRequestMethod("POST");
                connection.setRequestProperty(
                        "Content-Type",
                        "application/json"
                );
                connection.setDoOutput(true);

                String json = objectMapper.writeValueAsString(
                        new OllamaRequest(
                                "llama3.2:3b",
                                message,
                                true
                        )
                );

                try (OutputStream requestStream =
                             connection.getOutputStream()) {

                    requestStream.write(json.getBytes());
                    requestStream.flush();
                }

                try (BufferedReader reader =
                             new BufferedReader(
                                     new InputStreamReader(
                                             connection.getInputStream()))) {

                    String line;

                    while ((line = reader.readLine()) != null) {

                        JsonNode node =
                                objectMapper.readTree(line);

                        String response =
                                node.path("response").asText();

                        if (!response.isEmpty()) {

                            outputStream.write(
                                    response.getBytes()
                            );

                            outputStream.flush();
                        }

                        if (node.path("done").asBoolean()) {
                            break;
                        }
                    }
                }

                connection.disconnect();

            } catch (Exception e) {

                outputStream.write(
                        ("\n⚠️ NEXORA AI error: "
                                + e.getMessage()).getBytes()
                );

                outputStream.flush();
            }
        };
    }

    private record OllamaRequest(
            String model,
            String prompt,
            boolean stream
    ) {
    }
}