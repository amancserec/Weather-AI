import os

from hindsight_client import Hindsight


def main() -> None:
    api_key = os.getenv("HINDSIGHT_API_KEY")
    if not api_key:
        raise RuntimeError("Set HINDSIGHT_API_KEY before running this script.")

    base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")

    client = Hindsight(base_url=base_url, api_key=api_key)

    # Replace with your bank id if needed.
    bank_id = os.getenv("HINDSIGHT_BANK_ID", "weather-ai-main")

    memory_text = "User prefers commute advice focused on rain and wind."

    retain_response = client.retain(
        bank_id=bank_id,
        content=memory_text,
        metadata={"source": "example-script"},
    )
    print("Retain response:", retain_response)

    recall_response = client.recall(
        bank_id=bank_id,
        query="commute preference",
    )
    print("Recall response:", recall_response)

    client.close()


if __name__ == "__main__":
    main()
