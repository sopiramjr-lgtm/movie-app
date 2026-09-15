package com.movie_app.movie_app_api.core.config;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ScalarController {

    /**
     * Serves a gorgeous Scalar API reference documentation page at /scalar
     */
    @GetMapping(value = "/scalar", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> scalarApiReference() {
        String html = """
            <!doctype html>
            <html>
              <head>
                <title>Movie App API Reference</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
              </head>
              <body>
                <script
                  id="api-reference"
                  data-url="/v3/api-docs"
                  src="https://cdn.jsdelivr.net/npm/@scalar/api-reference">
                </script>
              </body>
            </html>
            """;

        return ResponseEntity.ok(html);
    }
}