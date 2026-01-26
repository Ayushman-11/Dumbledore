import argparse
import json
import os
import sys
from textwrap import dedent

import requests

MODEL = "gemini-3-flash-preview"
API_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


def build_payload(prompt: str) -> dict:
    return {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt.strip() or "Say hello"
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2
        }
    }


def pretty(obj):
    try:
        return json.dumps(obj, indent=2, ensure_ascii=False)
    except TypeError:
        return str(obj)


def probe(api_key: str, prompt: str) -> int:
    params = {"key": api_key}
    payload = build_payload(prompt)
    response = requests.post(
        API_ENDPOINT,
        params=params,
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30
    )

    retry_after = response.headers.get("Retry-After")
    print(f"HTTP {response.status_code} {response.reason}")
    if retry_after:
        print(f"Retry-After header: {retry_after}s")

    try:
        body = response.json()
        print("Response body:\n" + pretty(body))
    except ValueError:
        print("Raw response body:\n" + response.text)
        body = None

    if response.ok and body:
        candidate = body.get("candidates", [{}])[0]
        text_parts = [part.get("text", "") for part in candidate.get("content", {}).get("parts", [])]
        text = "\n".join(part for part in text_parts if part).strip()
        print("\nModel output:\n" + (text or "<empty>"))
    else:
        print("\nNon-200 response received. See body above for error details.")

    return response.status_code


def main():
    parser = argparse.ArgumentParser(
        description="Fire a single request at the Gemini API to differentiate rate limits from code bugs."
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("GEMINI_API_KEY"),
        help="API key to use (defaults to GEMINI_API_KEY env var)."
    )
    parser.add_argument(
        "--prompt",
        default="Explain prepared statements in one paragraph.",
        help="Prompt to send in the test request."
    )
    args = parser.parse_args()

    if not args.api_key:
        sys.exit("Provide an API key via --api-key or the GEMINI_API_KEY environment variable.")

    print(dedent(
        f"""
        Testing Gemini endpoint {API_ENDPOINT}
        Model: {MODEL}
        Prompt: {args.prompt}
        """
    ).strip())

    status = probe(args.api_key, args.prompt)
    if status == 429:
        print("\nResult: Rate limit (429) confirmed from the API – client code is not the culprit.")
    elif status == 200:
        print("\nResult: Request succeeded – investigate frontend/back-end code if the UI still fails.")
    else:
        print(f"\nResult: Received HTTP {status}. Check the payload and API key.")


if __name__ == "__main__":
    main()
