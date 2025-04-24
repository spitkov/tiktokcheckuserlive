# tiktok live checker

simple api to check which tiktok users are currently live streaming.

## install

```
npm install
npm start
```

runs on port 3000 by default. change with `PORT` environment variable.

## how to use

just get the `/check` endpoint with a list of usernames:

```
/check?users=sodiapu,mc_isti2,vadaszgyula_1
```

### response

you'll get back a plain text response with comma-separated (if multiple) usernames of people who are currently live:

```
sodiapu (sodiapu,sodika)
```

if nobody's live, you'll get an empty response.
