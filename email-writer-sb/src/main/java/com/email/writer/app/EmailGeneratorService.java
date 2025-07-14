package com.email.writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {
    private final WebClient webClient;
    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder)
    {
        this.webClient=webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest)
    {
        //Build prompt
        String prompt=buildPrompt(emailRequest);
        //Craft a request
        Map<String,Object>requestBody=Map.of(
                "contents",new Object[]{
                        Map.of("parts",new Object[]{
                                Map.of("text",prompt),
                        })
                }
        );
        //Do request and then get response
        String response=webClient.post()
                .uri(geminiApiUrl+geminiApiKey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        //Return Extract Response
        return extractResponseContent(response);
    }

    private String extractResponseContent(String response)
    {
        try
        {
            ObjectMapper mapper=new ObjectMapper();//jackson library
            JsonNode rootNode=mapper.readTree(response);
//            return rootNode.get("contents").toString();
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();//return string
        }catch(Exception ex)
        {
            return "Error Processing Request: "+ex.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt=new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content and please don't generate a subject line:\n");
        if(emailRequest.getTone()!=null && !emailRequest.getTone().isEmpty())
        {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone for the following email content and give a correct reply mail, directly give the mail reply dont provide any pre text:\n");
        }
        prompt.append("\nOriginal email content:\n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}