package com.autoapply.formautomation.dto;

import java.util.Map;

/**
 * DTO representing an action to be performed during automation.
 */
public class AutomationActionDTO {
    private String actionType; // fill_field, upload_file, click_button, wait, scroll, select_option, etc.
    private String fieldSelector; // CSS selector for the target element
    private String fieldId;
    private String fieldName;
    private String value; // Value to fill or action to perform
    private Map<String, String> metadata; // Additional metadata for the action
    private Integer order; // Order of execution
    private String description; // Human-readable description of the action

    public AutomationActionDTO() {}

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getFieldSelector() {
        return fieldSelector;
    }

    public void setFieldSelector(String fieldSelector) {
        this.fieldSelector = fieldSelector;
    }

    public String getFieldId() {
        return fieldId;
    }

    public void setFieldId(String fieldId) {
        this.fieldId = fieldId;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Map<String, String> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, String> metadata) {
        this.metadata = metadata;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

