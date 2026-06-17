Project Goal : 
Making a web app that condenses, eases and speeds up the average interaction     between cusotmers and travel agents of Dalmar Travel agency. 
 Average user story of Agents working at Dalmar Travel Agency: 
  1. Customer walks in the shop or calls in
  2. Customer gives earliest and latest departure + Comeback dates(sometimes its only one way)(The Travel Agency sells ticket at a discounted rates to the web as a Unique Selling Point (also business provides customers with info that is usually foreign to travellers), it does so by using Travelport a well known system for Agencies in the business, Dalmar Travel Agencies solely sells TICKETs (airplane tickets that is))
  3. Customer is given best dates to travel by Agent based on that current day and time 
  4. Customer decides to continue with interaction(as opposed to leaving and not being interested in continuing purchase of ticket)
  5. Reservation is made for customer
  6. Agent quotes again the final price once more 
  7. customer is given date of expiry of reservation 
  8. customer may pay through cash, card or money transer
  9. final ticket is send to customers phone and printed out at the office

 intended goal of Dalmar Travel Agency Webapp: 
 - providing means of speeding up key story moments such as average user story point 2. (mentioned above which was customer givng earliest and latest departure +/ Comeback dates if needed)
 -providing a dashboard for Agents that helps them keep track of their customers number, whether they paid and how much of the total fee they paid
 -whether their ticket was given to them 
 - whether Agent made a Card(This is a specialised term for a software called TAAMS used by Agents in the company that notes down transaction and ticket details teh web app will not interact with this software and instead will just make using less frantic than usual as theey usually need to recall all info (since sometimes there are too many customers forcing them to do it at a later time where they might forget details))
 - the web app should offer somali language since 90% of customer pool is somali
 - web app should allow customer request to be send in a generated whatsapp message to all agents and should note which agents took on task 
 - webb app may feature sign up process(TBD)
 - other features to be added to aid the agents are free to be added. 


Project Approach: 
1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.

If multiple interpretations exist, present them - don't pick silently.

If a simpler approach exists, say so. Push back when warranted.

If something is unclear, stop. Name what's confusing. Ask.

2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.

No abstractions for single-use code.

No "flexibility" or "configurability" that wasn't requested.

No error handling for impossible scenarios.

If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.

Don't refactor things that aren't broken.

Match existing style, even if you'd do it differently.

If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.

Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"

"Fix the bug" → "Write a test that reproduces it, then make it pass"

"Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]