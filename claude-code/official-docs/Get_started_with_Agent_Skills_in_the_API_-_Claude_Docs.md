# Get started with Agent Skills in the API

Agent Skills

Learn how to use Agent Skills to create documents with the Claude API in under 10 minutes.

This tutorial shows you how to use Agent Skills to create a PowerPoint presentation. You'll learn how to enable Skills, make a simple request, and access the generated file.

## 

Prerequisites

-   [Anthropic API key](https://platform.claude.com/settings/keys)
-   Python 3.7+ or curl installed
-   Basic familiarity with making API requests

## 

What are Agent Skills?

Pre-built Agent Skills extend Claude's capabilities with specialized expertise for tasks like creating documents, analyzing data, and processing files. Anthropic provides the following pre-built Agent Skills in the API:

-   **PowerPoint (pptx)**: Create and edit presentations
-   **Excel (xlsx)**: Create and analyze spreadsheets
-   **Word (docx)**: Create and edit documents
-   **PDF (pdf)**: Generate PDF documents

**Want to create custom Skills?** See the [Agent Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills) for examples of building your own Skills with domain-specific expertise.

## 

Step 1: List available Skills

First, let's see what Skills are available. We'll use the Skills API to list all Anthropic-managed Skills:

You see the following Skills: 
```
pptx
```
, 
```
xlsx
```
, 
```
docx
```
, and 
```
pdf
```
.

This API returns each Skill's metadata: its name and description. Claude loads this metadata at startup to know what Skills are available. This is the first level of **progressive disclosure**, where Claude discovers Skills without loading their full instructions yet.

## 

Step 2: Create a presentation

Now we'll use the PowerPoint Skill to create a presentation about renewable energy. We specify Skills using the 
```
container
```
 parameter in the Messages API:

Let's break down what each part does:

-   **
    ```
    container.skills
    ```
    **: Specifies which Skills Claude can use
-   **
    ```
    type: "anthropic"
    ```
    **: Indicates this is an Anthropic-managed Skill
-   **
    ```
    skill_id: "pptx"
    ```
    **: The PowerPoint Skill identifier
-   **
    ```
    version: "latest"
    ```
    **: The Skill version set to the most recently published
-   **
    ```
    tools
    ```
    **: Enables code execution (required for Skills)
-   **Beta headers**: 
    ```
    code-execution-2025-08-25
    ```
     and 
    ```
    skills-2025-10-02
    ```

When you make this request, Claude automatically matches your task to the relevant Skill. Since you asked for a presentation, Claude determines the PowerPoint Skill is relevant and loads its full instructions: the second level of progressive disclosure. Then Claude executes the Skill's code to create your presentation.

## 

Step 3: Download the created file

The presentation was created in the code execution container and saved as a file. The response includes a file reference with a file ID. Extract the file ID and download it using the Files API:

For complete details on working with generated files, see the [code execution tool documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool#retrieve-generated-files).

## 

Try more examples

Now that you've created your first document with Skills, try these variations:

### 

Create a spreadsheet

### 

Create a Word document

### 

Generate a PDF

## 

Next steps

Now that you've used pre-built Agent Skills, you can: