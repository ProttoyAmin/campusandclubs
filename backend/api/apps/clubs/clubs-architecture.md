club join:

switch: 
    case(scope==global):
        privacy == secret:
            -- requires invitation
        join mode == instant && privacy == public:
            -- joins instantly
        join mode == application && privacy == public or privacy == private:
            -- user submits application
        join mode == invite && privacy == private:
            -- requires invitation
    case (scope == exclusive):
        -- can't join if origins != user active affiliation
    case (scope == exclusive):
        -- can't join if user.affialition == None

join approval:
    -- club member with manage:members permission or owner join approves, either approve directly or send email.
    -- bulk approval with email. (eg. your request has been approved. join this interview session at the campus or something in the email body.)

club leave:
    -- submits a resignation request and wait for the approval (this should come from the club config. eg: leave_request = boolean)

