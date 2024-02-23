# Youtube Buddy

> **_WORK IN PROGRESS_**

A discord bot that allows you to play music from Youtube without any limitations!

## Installation and usage

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

1. Clone the repository:

```bash
git clone https://github.com/filip-stepien/youtube-buddy.git
```

2. Navigate to the project directory:

```bash
cd youtube-buddy
```

3. Install dependancies:
```bash
npm install
```

4. Make a new [Discord Application](https://discord.com/developers/applications).

5. Get an invitation link (OAuth2 > URL Generator), and invite a bot to your server:

- Set scope to `bot`
- Select the following permissions:
    - `Send Messages`
    - `Connect`
    - `Speak`

5. Create an `.env` file in project directory.

6. Make enviroment variables containing your application token, application client ID and your server guild ID. The file should look like this:
```
TOKEN = YOUR_SECRET_TOKEN
CLIENT_ID = YOUR_CLIENT_ID
GUILD_ID = YOUR_GUILD_ID
```

7. Deploy the commands on your server:

```bash
npm run deploy
```
> **_NOTE:_**  It may take a while for Discord to actually display slash commands.

8. Run the application:

```bash
npm start
```