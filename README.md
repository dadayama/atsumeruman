# atsumeruman

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

### Slack

1. Access the [Slack apps page](https://api.slack.com/apps) and create a bot user.
2. Get the **Client Secret**, **Signing Secret**, and **Bot User OAuth Token**
3. Set the slash commands.
   - Request URL: Firebase 'Command' function URL (e.g. `https://us-central1-${Project ID}.cloudfunctions.net/command`)
   - Commands:
     - `/atsumeruman-join`
     - `/atsumeruman-join`
     - `/atsumeruman-list`
4. Invite the bot user to the target channel.

### Firebase

1. Access the [Firebase console screen](https://console.firebase.google.com/) and create a project.
2. Set the default GCP resource location. (Without it, the function will fail to deploy.)
3. Login to firebase using the CLI and select the project you just created.

```
$ firebase login
$ firebase use ${Firebase project ID}
```

4. Create a `config` directory and create a `default.json` file.

```
$ mkdir config
$ touch config/default.json
```

5. Describe the necessary settings in `default.json`.

```
$ vi config/default.json

// config/default.json
{
  "general": {
    "video_chat_url": "Some video chat url (e.g. Google meet URL)",
    "cron_schedule": "Cron schedule (e.g. '0 15 * * *')",
    "number_of_target": "Number of people to gather in chat"
  },
	"platform": {
		"firebase": {
			"firestore": {
				"collection": {
					"current_members": "Firestore collection name of participant (e.g. 'current')",
					"history_members": "Firestore collection name of convocation history (e.g. 'history')"
				}
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

6. Reflect the settings in firebase.

```
$ npm run config:set
```

7. Deploy application.

```
$ npm run deploy
```

## Usage

1. Type the slash command.
   - `/atsumeruman-join`: Will be randomly notified when the chat starts.
   - `/atsumeruman-leave`: Will no longer be notified when the chat starts.
   - `/atsumeruman-list`: Displays the list of members to be notified.
2. Wait for a notification on Slack to start chatting.
