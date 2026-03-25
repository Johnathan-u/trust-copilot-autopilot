"""REPLY-207: Reply classifier tests."""

import pytest
from workers.inbox.reply_classifier import classify_reply, ReplyLabel, NextAction


class TestOverrides:
    def test_unsubscribe_overrides(self):
        r = classify_reply("Please unsubscribe me from this list.")
        assert r.label == ReplyLabel.UNSUBSCRIBE
        assert r.next_action == NextAction.SUPPRESS_FOREVER
        assert r.is_override

    def test_legal_overrides(self):
        r = classify_reply("This is a GDPR data deletion request.")
        assert r.label == ReplyLabel.LEGAL_PRIVACY
        assert r.next_action == NextAction.SUPPRESS_FOREVER
        assert r.is_override

    def test_opt_out_overrides(self):
        r = classify_reply("Please opt out me from future emails.")
        assert r.label == ReplyLabel.UNSUBSCRIBE
        assert r.is_override


class TestClassification:
    def test_interested(self):
        r = classify_reply("Sounds good, let's chat about this next week.")
        assert r.label == ReplyLabel.INTERESTED
        assert r.next_action == NextAction.OPEN_INTAKE

    def test_send_details(self):
        r = classify_reply("Can you send me more details about pricing?")
        assert r.label == ReplyLabel.SEND_DETAILS
        assert r.next_action == NextAction.SEND_DETAILS

    def test_referral(self):
        r = classify_reply("The better person to talk to would be our CTO, Jane.")
        assert r.label == ReplyLabel.REFERRAL
        assert r.next_action == NextAction.FOLLOW_UP_REFERRAL

    def test_wrong_person(self):
        r = classify_reply("I'm the wrong person for this. Not my department.")
        assert r.label == ReplyLabel.WRONG_PERSON
        assert r.next_action == NextAction.UPDATE_BUYER

    def test_not_now(self):
        r = classify_reply("Not right now, maybe next quarter.")
        assert r.label == ReplyLabel.NOT_NOW
        assert r.next_action == NextAction.SNOOZE_90

    def test_already_solved(self):
        r = classify_reply("We already have a solution in place, no thanks.")
        assert r.label == ReplyLabel.ALREADY_SOLVED

    def test_out_of_office(self):
        r = classify_reply("I am out of the office until January 15th.")
        assert r.label == ReplyLabel.OUT_OF_OFFICE
        assert r.next_action == NextAction.SNOOZE_30

    def test_unclear(self):
        r = classify_reply("Hmm, ok.")
        assert r.label == ReplyLabel.UNCLEAR
        assert r.next_action == NextAction.NO_ACTION

    def test_confidence_present(self):
        r = classify_reply("Let's schedule a call.")
        assert r.confidence > 0
