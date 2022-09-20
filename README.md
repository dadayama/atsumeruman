# pibo

This is a Bot that runs on Slack and randomly convenes from the participating members to create a place for chatting.

## Prerequisites

- In order to run this bot, you need a firebase project and a firebase.
- This bot uses functions, hosting, and firestore among the functions provided by firebase.
- The firebase project needs to be on the Blaze plan to work.
- This bot runs on Slack.
- You will need to prepare a separate Slack bot account.

## Setup

### Local environment

1. Install the modules and firebase CLI

```
$ npm install
$ npm install -g firebase-tools
```

### Slack (1)

1. Access the [Slack apps page](https://api.slack.com/apps) and create a bot user.
2. Get the authentication information shown below.

   - Client Secret
   - Signing Secret
   - Bot User OAuth Token

3. Invite the bot user to the target channel.

### Firebase

1. Access the [Firebase console](https://console.firebase.google.com/) and create a project.
2. Set the default GCP resource location. (Without it, the function will fail to deploy.)
3. Switch firestore mode to native mode.
4. Activate the Cloud Filestore API.
5. Login to firebase using the CLI and select the project you just created.

```
$ firebase login
$ firebase use ${Firebase project ID}
```

6. Describe the necessary settings in `.runtimeconfig.json`.

```
$ vi .runtimeconfig.json
{
  "general": {
    "video_chat_url": "Some video chat url (e.g. Google meet URL)",
    "number_of_target_member": "Number of people to gather in chat"
  },
	"platform": {
		"firebase": {
      "functions": {
    		"cron_schedule_start": "Chat start date and time (e.g. '0 15 * * *')",
    		"cron_schedule_end": "Chat end date and time (e.g. '15 15 * * *')",
      }
		}
	},
	"chat": {
		"slack": {
			"signing_secret": "Secret key of Slack bot",
			"bot_token": "Token of Slack bot",
			"target_channel": "Some target Slack channel ID"
		}
	}
}
```

7. Reflect the settings in firebase.

```
$ npm run config:set
```

8. Deploy application.

```
$ npm run deploy
```

### Slack (2)

1. Access the bot user setting page.
2. Set the slash commands.
   - Request URL: Firebase 'Command' function URL (e.g. `https://us-central1-${Project ID}.cloudfunctions.net/command`)
   - Commands:
     - `/hangar-flight-join`
     - `/hangar-flight-leave`
     - `/hangar-flight-list`

## Usage

1. Type the slash command.
   - `/hangar-flight-join`: Will be randomly notified when the chat starts.
   - `/hangar-flight-leave`: Will no longer be notified when the chat starts.
   - `/hangar-flight-list`: Displays the list of members to be notified.
2. Wait for a notification on Slack to start chatting.
