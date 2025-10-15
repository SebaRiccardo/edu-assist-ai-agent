Refactor this screen to allow the users init the gmail auth flow using #file:route.ts endpoint. As you can see in the #file:courses.types.ts there is a inbox field that represents a gmail account for that course, because the user can have multiple gmails account that he wants to analyze for the course. I need to create allow the user to add a gmail account to the couse at the same time that I initiate the gmail flow with composio sdk at the /gmail-auth flow. I need a way to link a gmail address to the composion connectedAccount of the user.

In summary: I need to create a auth flow for the user to connect the gmail address added to the course to a connected account from composio. The inboxes has a id field, i think is a good place to place the composio connected account id there.

<example>
import { Composio } from '@composio/core';

const composio = new Composio({apiKey: "YOUR_COMPOSIO_API_KEY"});

// Use the "AUTH CONFIG ID" from your dashboard
const authConfigId = 'your_auth_config_id';
// Use a unique identifier for each user in your application
const userId = 'user_4567';

const connRequest = await composio.connectedAccounts.initiate(
userId,
authConfigId,
{
callbackUrl: 'https://www.yourapp.com/callback',
}
);
console.log(`Redirect URL: ${connRequest.redirectUrl}`);

const connectedAccount = await connRequest.waitForConnection();

// Alternative: if you only have the connection request ID
// const connectedAccount = await composio.connectedAccounts
// .waitForConnection(connRequest.id);
// Recommended when the connRequest object is no longer available

console.log(`Connection established: ${connectedAccount.id}`);
</example>
