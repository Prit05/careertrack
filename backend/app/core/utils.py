from datetime import date, datetime, time, timezone


def date_to_datetime(
    value: date | None,
) -> datetime | None:
    if value is None:
        return None

    return datetime.combine(
        value,
        time.min,
        tzinfo=timezone.utc,
    )