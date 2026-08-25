import json
import urllib.error
import urllib.request

from . import config


def send_telegram_message(text: str) -> tuple[bool, str]:
    """Send a message to the configured Telegram chat.

    Uses only the Python standard library (no extra dependency). Returns
    (ok, detail). Safe to call even when Telegram is not configured.
    """
    if not config.TELEGRAM_ENABLED:
        return False, "Telegram not configured (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)"

    url = f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps(
        {
            "chat_id": config.TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return True, f"sent ({resp.status})"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode('utf-8', 'ignore')}"
    except Exception as e:  # network errors, timeouts, etc.
        return False, str(e)


def build_order_message(order, event) -> str:
    """Format a new-order alert. Call while the DB session is still open."""
    total = f"${order.total_cents / 100:,.2f}"
    event_title = event.title if event else f"#{order.event_id}"
    lines = [
        "🎟️ <b>New ticket order</b>",
        "",
        f"<b>Event:</b> {event_title}",
        f"<b>Qty:</b> {order.quantity}   <b>Total:</b> {total}",
        f"<b>Buyer:</b> {order.customer_name}",
        f"<b>Email:</b> {order.customer_email}",
        f"<b>Phone:</b> {order.phone or '—'}",
        f"<b>Pay via:</b> {order.payment_method}",
        f"<b>Payment ref:</b> {order.payment_reference or '—'}",
        f"<b>Payment status:</b> {order.payment_status}",
        f"<b>Booking code:</b> <code>{order.code}</code>",
    ]
    return "\n".join(lines)
