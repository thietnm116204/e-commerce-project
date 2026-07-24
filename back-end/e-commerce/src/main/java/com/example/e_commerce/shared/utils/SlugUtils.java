package com.example.e_commerce.shared.utils;

import com.github.slugify.Slugify;
import org.springframework.stereotype.Component;

@Component
public class SlugUtils {
    private final Slugify slugify = Slugify.builder().build();

    public String generateSlug(String name) {
        return slugify.slugify(name);
    }
}
