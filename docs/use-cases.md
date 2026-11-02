# Eventhub — Use Cases

```mermaid
graph LR
    Speaker([Speaker])
    Organizer([Organizer])
    Administrator([Administrator])

    Speaker --> LogIn(Log In)
    Speaker --> SetPassword(Set Password)
    Speaker --> EditProfile(Edit Profile)
    Speaker --> ProposeTalk(Propose Talk)
    Speaker --> AnswerDate(Answer Proposed Date)
    Speaker --> HandInMaterials(Hand In Agenda and Materials)
    Speaker --> UpdateMaterials(Update Agenda and Materials)
    Speaker --> ViewEventDetails(View Event Details)
    Speaker --> DropOut(Drop Out of Event)
    Speaker --> AfterEventTasks(Complete After-Event Tasks)

    Organizer --> LogIn
    Organizer --> SetPassword
    Organizer --> EditProfile
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

    Administrator --> LogIn
    Administrator --> EditProfile
    Administrator --> AddOrganizer(Add Organizer)
    Administrator --> RemoveOrganizer(Remove Organizer)

    InviteSpeaker -. includes .-> CreateAccount(Create Speaker Account)
    AddOrganizer -. includes .-> CreateOrganizerAccount(Create Organizer Account)
```

## Accounts

Speakers can't create their own accounts. An organizer creates each one by sending the invitation, and the speaker only sets a password.

Organizers can't create their own accounts either. An administrator creates each one by adding the organizer to the community, and the organizer only sets a password. Removing an organizer stops them logging in, and their past work stays.

Keep `registrationAllowed: false` when the real realm is set up.
