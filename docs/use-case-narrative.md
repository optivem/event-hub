# Eventhub — Use Case Narrative: Invite Speaker

### Use Case Name
Invite Speaker

### Primary Actor
Organizer

### Goal
The organizer invites a potential speaker to speak on a proposed date, which creates the speaker's account.

### Preconditions
- The organizer is logged into the system.
- The potential speaker is listed in the potential speakers.
- An open date is available.

### Main Success Scenario
1. The organizer opens the potential speaker.
2. The organizer confirms that the topic is technical and chooses to invite the speaker.
3. The organizer selects a date.
4. The organizer sends the invitation.
5. The system creates the speaker's account.
6. The system emails the speaker the invitation, with a link to set a password and answer within 1 week.
7. The system shows the organizer the invitation status and the reply countdown.

### Extensions (Alternative Flows)
- 2a. The topic isn't technical:
    - The organizer marks the speaker as not invited, and the use case ends.
- 5a. The speaker already has an account:
    - The system keeps the existing account, and the invitation asks the speaker to log in as normal.
- 7a. No reply after 1 week:
    - The system sends the speaker a reminder email.
- 7b. No reply after 1 more week:
    - The path ends for this speaker, and the date goes to the next potential speaker.

### Postconditions
- The speaker has an account.
- The speaker has received the invitation.
- The invitation is waiting for the speaker's reply.

---

## Use Case Narrative Template

In a Real Life Project, we would write Use Case Narratives for the other Use Cases too. Use the template below:

### Use Case Name
TODO: Use Case Name

### Primary Actor
TODO: Primary Actor

### Goal
TODO: What the actor is trying to achieve.

### Preconditions
- TODO: What must be true before this use case starts.

### Main Success Scenario
1. TODO: First step.
2. TODO: Next step.
3. TODO: Continue until the goal is achieved.

### Extensions (Alternative Flows)
- TODO: Step number + condition:
    - TODO: What the system does differently.

### Postconditions
- TODO: What is true after successful completion.
