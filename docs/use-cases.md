# Eventhub — Use Cases

```mermaid
graph LR
    Speaker([Speaker])
    Organizer([Organizer])

    Speaker --> LogIn(Log In)
    Speaker --> SetPassword(Set Password)
    Speaker --> ProposeTalk(Propose Talk)
    Speaker --> AnswerDate(Answer Proposed Date)
    Speaker --> HandInMaterials(Hand In Agenda and Materials)
    Speaker --> UpdateMaterials(Update Agenda and Materials)
    Speaker --> ViewEventDetails(View Event Details)
    Speaker --> DropOut(Drop Out of Event)
    Speaker --> AfterEventTasks(Complete After-Event Tasks)

    Organizer --> LogIn
    Organizer --> FilterSpeakers(Filter Potential Speakers)
    Organizer --> InviteSpeaker(Invite Speaker)
    Organizer --> ProposeAnotherDate(Propose Another Date)
    Organizer --> ConfirmDate(Confirm Date)
    Organizer --> TrackMaterials(Track Agenda and Materials)
    Organizer --> ReviewMaterials(Review Agenda and Materials)
    Organizer --> ApproveEvent(Approve Event)
    Organizer --> PublishEvent(Publish Event)
    Organizer --> RescheduleEvent(Reschedule Event)
    Organizer --> CancelEvent(Cancel Event)
    Organizer --> ArrangeNewSpeaker(Arrange New Speaker)
    Organizer --> AddCoHost(Add Speaker as Co-Host)
    Organizer --> ThankSpeaker(Thank Speaker)

    InviteSpeaker -. includes .-> CreateAccount(Create Speaker Account)
```

## Accounts

Speakers can't create their own accounts. An organizer creates each one by sending the invitation, and the speaker only sets a password. Keep `registrationAllowed: false` when the real realm is set up.
