"""Inbound WebSocket-event handlers.

The consumer stays a thin dispatcher — feature logic lives in these
modules and is routed through :data:`INBOUND_HANDLERS`.
"""
from .chat import chat_handlers, INBOUND_HANDLERS

__all__ = ["INBOUND_HANDLERS", "chat_handlers"]
