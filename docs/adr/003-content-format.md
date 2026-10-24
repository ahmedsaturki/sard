# ADR-003: Portable Text as Canonical Content Format

## Status
Accepted

## Context
WordPress stores content as HTML, which:
- Ties content to presentation
- Is hard to validate or transform
- Cannot be reliably consumed by LLMs/agents
- Makes multi-channel publishing difficult

Sard needs a structured, validation-friendly format that:
- Separates content from presentation
- Is type-safe and schema-validated
- Can be rendered to HTML, mobile, email, JSON for agents
- Supports rich text, blocks, and nested structures

## Decision
Adopt **Portable Text** as the canonical content format.

### Portable Text Structure
```json
{
  "_type": "content",
  "title": "My Article",
  "body": [
    {
      "_type": "block",
      "children": [
        { "_type": "span", "text": "Hello ", "marks": ["bold"] },
        { "_type": "span", "text": "World", "marks": [] }
      ]
    },
    {
      "_type": "image",
      "url": "/images/pic.jpg",
      "alt": "Description"
    }
  ]
}
```

### Implementation
- `packages/portable-text`: parser, validator, serializer
- Schema validation with Zod
- Renderers: HTML, React, plain text, JSON for agents
- Migration tools from WordPress HTML → Portable Text

### Editor Integration
- Rich text editor (TipTap / Lexical) outputting Portable Text
- Block-level editing for images, embeds, custom components
- Real-time validation

## Consequences
### Positive
- Content is structured data, not markup soup
- Type-safe transformations
- Easy to render for different channels
- LLMs can consume structured JSON directly
- Validation prevents invalid content

### Negative
- Requires editor training (not WYSIWYG in WordPress sense)
- Existing WordPress content needs migration

## Compliance
- Layer 2 (Structured Content): Portable Text is the implementation
- Layer 6 (Agents): JSON format is machine-readable
- Layer 5 (SEO): Structured data can be extracted reliably
