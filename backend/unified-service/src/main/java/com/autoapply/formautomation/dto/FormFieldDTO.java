package com.autoapply.formautomation.dto;

import java.util.Map;

/**
 * DTO representing a form field detected on a page.
 */
public class FormFieldDTO {
    private String id;
    private String name;
    private String type; // text, email, tel, textarea, select, file, etc.
    private String tag; // input, textarea, select, etc.
    private String label;
    private String placeholder;
    private String value;
    private Boolean required;
    private Map<String, String> attributes;
    private String selector; // CSS selector for the field
    private String fieldCategory; // personal_info, contact, experience, education, skills, resume, cover_letter, etc.

    public FormFieldDTO() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getPlaceholder() {
        return placeholder;
    }

    public void setPlaceholder(String placeholder) {
        this.placeholder = placeholder;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public Map<String, String> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, String> attributes) {
        this.attributes = attributes;
    }

    public String getSelector() {
        return selector;
    }

    public void setSelector(String selector) {
        this.selector = selector;
    }

    public String getFieldCategory() {
        return fieldCategory;
    }

    public void setFieldCategory(String fieldCategory) {
        this.fieldCategory = fieldCategory;
    }
}

