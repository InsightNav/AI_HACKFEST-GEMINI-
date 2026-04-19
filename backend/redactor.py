from presidio_analyzer import AnalyzerEngine


analyzer = AnalyzerEngine()


# ─────────────────────────────
# Redaction
# ─────────────────────────────
def redact_text(text: str):
    results = analyzer.analyze(text=text, language="en")

    if not results:
        return text, {}

    mapping = {}
    redacted_text = text

    # Process in reverse order to avoid index shifting
    sorted_results = sorted(results, key=lambda r: r.start, reverse=True)

    for i, res in enumerate(sorted_results):
        placeholder = f"[REDACTED_{res.entity_type}_{i}]"

        mapping[placeholder] = text[res.start:res.end]

        redacted_text = (
            redacted_text[:res.start]
            + placeholder
            + redacted_text[res.end:]
        )

    return redacted_text, mapping


# ─────────────────────────────
# Restore (flat)
# ─────────────────────────────
def restore_text(text: str, mapping: dict):
    for placeholder, original in mapping.items():
        text = text.replace(placeholder, original)
    return text


# ─────────────────────────────
# Restore (nested structures)
# ─────────────────────────────
def restore_text_deep(data, mapping):
    if isinstance(data, dict):
        return {key: restore_text_deep(value, mapping) for key, value in data.items()}

    if isinstance(data, list):
        return [restore_text_deep(item, mapping) for item in data]

    if isinstance(data, str):
        return restore_text(data, mapping)

    return data