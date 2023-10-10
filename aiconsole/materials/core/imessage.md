<!---
Use this to get to know how to handle iMessage and Contacts apps in mac in order to perform tasks using them.
-->

# How to get contact information from contacts

Example: looking for a contact with a name Agata:

```applescript
tell application "Contacts"
    set r to {}
    repeat with p in (every person whose name contains "agata" or name contains "Agata")
        set end of r to "Name: " & name of p & "\nPhones: " & (value of phones of p) & "\nEmails: " & (value of emails of p) & "\nAddresses: " & (street of addresses of p) & ", " & (city of addresses of p) & ", " & (state of addresses of p) & ", " & (zip of addresses of p) & ", " & (country of addresses of p) & "\n---------------------\n"
    end repeat
    return r
end tell
```

# How to send an imessage to a contact given a phone number

You must always specify an icloud email or phone, don't use names surnames or nicks.

Example (Replace the example +1111111111 with a real phone number):

```
tell application "Messages"
    send "Your message text here line 1" & "\nline2" to buddy "+1111111111"
end tell
```

# Monitoring messages for read receipts

-- AlertWhenRead.app
-- by Erika Foxelot
--   email erika@foxelot.com
--   reddit u/erikafoxelot
--
-- Monitors the Messages app and alerts the user when the selected chat receives a read receipt
--
-- Script must be exported into your Applications folder, 'Stay Open After Run Handler' must be selected,
-- and Code Sign must be set to 'Sign to Run Locally'. Requires Full Disk Access permission,
-- which the script will check and prompt for when run.
--
-- To use: In Messages, select the chat you want to monitor, then launch this app. If you want
-- to cancel, right-click on the app in the dock and select Quit.
--
-- Good luck :3
--
-- Thanks to my fox Violet for debugging help and her constant encouragement and support. <3
-- Thanks to chatGPT for a lot of brainstorming and help where google failed me.
-- Thanks to redditor u/stephancasas for a MUCH better way to retrieve the currently selected chat!
--
-- Known Issues:
--   If you click on any Notification this app produces after the app has quit, it will re-launch.
--   Apparently there's nothing I can do about this except maybe not use notifications.

global sql_shell_command, sound_path, selected_participant

on run
	set rerun_required to false
	
	if not CheckForDatabaseAccessPermission() then
		set rerun_required to true
		try
			display alert "Permissions not set" message ¬
				"This application requires that it be located in your Applications folder, and that it is granted Full Disk Access in order to monitor the iMessages database. You can find this permission in the Privacy and Security section of System Settings." as critical buttons {"Open Full Disk Access Permissions", "Close"} default button "Close" cancel button "Close"
		on error number -128
			-- Close button was clicked
			quit
			return
		end try
		
		do shell script "open 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles'"
	end if
	
	if rerun_required then
		try
			display alert "Permissions Change" message ¬
				"Permissions were changed; please re-launch the application." as critical buttons {"Close"} default button "Close" cancel button "Close"
		end try
		quit
		return
	end if
	
	
	set chat_details to GetSelectedConversation()
	set chat_id to first item of chat_details
	set selected_participant to second item of chat_details
	
	tell application "Messages"
		activate
	end tell
	
	display notification "Monitoring for read receipts from " & selected_participant ¬
		with title "AlertWhenRead"
	
	set chat_db_path to POSIX path of (path to home folder as text) & "Library/Messages/chat.db"
	set sql_query to "
		SELECT T1.is_read FROM message T1 
		INNER JOIN chat T3 ON T3.guid = \"" & chat_id & "\" 
		INNER JOIN chat_message_join T2 ON T2.chat_id = T3.ROWID AND T1.ROWID = T2.message_id AND T1.is_from_me = 1 
		ORDER BY T1.date DESC LIMIT 1;"
	set sql_shell_command to "sqlite3 " & chat_db_path & " '" & sql_query & "'"
	
	set sound_fx to "/System/Library/Sounds/Ping.aiff"
	set sound_path to quoted form of (POSIX path of (sound_fx as text))
	
	return 1
end run


on idle
	set has_been_read to do shell script sql_shell_command
	
	if has_been_read = "1" then
		-- This shell script was inspired by ChatGPT, who is an outstanding pair-programming partner!
		do shell script ("for i in {1..5}; do ( afplay " & sound_path & " & ) ; sleep 0.25; done > /dev/null 2>&1 &")
		
		tell application "Messages"
			activate
			display alert "Read Receipt Detected" message ¬
				(selected_participant as text) & " has read your latest message.
Detected on " & (current date) as informational buttons {"Ok"} default button "Ok"
		end tell
		tell me to quit
	end if
	
	return 1
end idle


on quit
	continue quit
end quit


-- Checks for chat.db access by trying to execute a query against it
on CheckForDatabaseAccessPermission()
	set chat_db_path to POSIX path of (path to home folder as text) & "Library/Messages/chat.db"
	set sql_query to "SELECT 0 WHERE 0;"
	set sql_shell_command to "sqlite3 " & chat_db_path & " '" & sql_query & "'"
	
	try
		do shell script sql_shell_command
	on error
		return false
	end try
	return true
end CheckForDatabaseAccessPermission


on GetSelectedConversation()
        -- This shell script provided by u/stephancasas - thanks!!
	set chat_id to do shell script "defaults read com.apple.MobileSMS.plist CKLastSelectedItemIdentifier | sed -e 's/^[^-]*-//'"
	tell application "Messages"
		set selected_participant to name of first window
	end tell
	
	return {chat_id, selected_participant}
end GetSelectedConversation

# Sending an image

on run {targetBuddyPhone, imagePath}
    set image to POSIX file imagePath
    tell application "Messages"
        set targetService to 1st service whose service type = iMessage
        set targetBuddy to buddy targetBuddyPhone of targetService

        send file image to targetBuddy
    end tell
end run

There is a bug where if the image path is any directory other than the user's Pictures directory it fails. But if the image is in the Pictures directory, then it works.