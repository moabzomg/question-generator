import asyncio
import csv
from pyppeteer import launch
email="myemail@gmail.com"
password="mypassword"
url="http://example.com"
module="mymodule"
print(url)
async def main():
    # Launch the browser
    browser = await launch(headless=False)  # Set headless=False for debugging
    page = await browser.newPage()
    
    # Navigate to the URL
    await page.goto(url)
    
    # Wait for the email input field to appear
    await page.waitForSelector('input[name="identifier"]')  # Ensure the email input is available
    
    # Enter the email in the input field
    email_input = await page.querySelector('input[name="identifier"]')
    if email_input:
        await email_input.type(email)
        print("Input email")
    # Wait for the "Next" button to be visible
    await page.waitForSelector('input.button.button-primary[type="submit"][value="Next"]')
    
    # Click on the "Next" button
    next_button = await page.querySelector('input.button.button-primary[type="submit"][value="Next"]')
    if next_button:
        print("Clicked Next button")
        await next_button.click()
    
    # Wait for the password input field to appear (after clicking next)
    await page.waitForSelector('input[name="credentials.passcode"]')  # Password input field name
    
    # Enter the password in the input field
    password_input = await page.querySelector('input[name="credentials.passcode"]')
    if password_input:
        await password_input.type(password)  # Replace 'something' with the actual password
        print("Input password")

    # Click the "Verify" button for the password form (if it exists)
    await page.waitForSelector('input.button.button-primary[type="submit"][value="Verify"]')
    next_button_password = await page.querySelector('input.button.button-primary[type="submit"][value="Verify"]')
    if next_button_password:
        await next_button_password.click()
        print("Verify button clicked")


    await page.waitForSelector('a.btn--primary.close-cookie-all')
    cookies_button = await page.querySelector('a.btn--primary.close-cookie-all')
    if cookies_button:
        await cookies_button.click()
        print("Accept Cookies button clicked")


    link = ""
    while not link:
        # Wait for the links to load
        await page.waitForSelector('a[href*="clmslearningpathdetails.prmain"]', {'timeout': 10000})

        # Find all the links matching the selector
        links = await page.querySelectorAll('a[href*="clmslearningpathdetails.prmain"]')

        # Iterate over the links to check each one
        for link in links:
            link_text = await page.evaluate('(element) => element.textContent.trim()', link)
            print(f"Link text found: {link_text}")
            if link_text == module:
                break

        print(f"Link text found: {link_text}")  # Debugging output

        # If the link's text is correct, click it
        if link_text == module:
            # Wait for navigation before clicking
            navigation_promise = page.waitForNavigation({'waitUntil': 'networkidle2'})
            await link.click()
            await navigation_promise
            print(f"Clicked on the '{module}' link.")
        else:
            print(f"Link text is not '{module}'.")

    # Wait for the section to load
    await page.waitForSelector('.collapsible-content .tbl-lp-details', {'timeout': 10000})

    # Find all the course records
    records = await page.querySelectorAll('.tbl-lp-details .tiles-layout')

    # Iterate through each record to find the "Guided Learning" course
    for record in records:
        # Get the course name
        course_name_element = await record.querySelector('a[href*="clmsCourseDetails.prMain"]')
        course_name = await page.evaluate('(element) => element.textContent.trim()', course_name_element)
        
        # If the course is "Guided Learning", find the "Access" button
        if "Guided Learning" in course_name:
            # Find the "Access" button
            access_button = await record.querySelector('a[title="Access Content"]')
            
            # If the access button is found, click it
            if access_button:
                print("Guided Learning Access button found, clicking...")
                await access_button.click()
            else:
                print("Access button not found for Guided Learning.")
            break  # Exit the loop once we've found and clicked the right course

    new_tab=None
    while not new_tab:
        await page.waitFor(1000)  # Wait for the pop-up to open
        windows = await browser.pages()
        print(f"Number of open windows: {len(windows)}")  # Debugging output
        # Check the URLs of all open pages (tabs)
        for window in windows:
            print(f"Window URL: {window.url}")  # Debugging output
            if "player/play" in window.url:
                continue_button = await window.querySelector('a.btn.btn-primary[href*="player/play"]')
                print("Continue button found, clicking...")
                if continue_button:
                    await continue_button.click()
                    # Wait for the new tab to load after clicking "Continue"
                    new_tab=None
                    await page.waitFor(1000)
            if window.url == 'https://knowledgequity.com.au/dashboard':
                new_tab = window
                # Switch to the new tab (dashboard URL)
                await new_tab.bringToFront()

                # Wait for the button to appear and click it
                await new_tab.waitForSelector('.MuiButtonBase-root.MuiCardActionArea-root.css-1m5f78l', {'timeout': 10000})
                button = await new_tab.querySelector('.MuiButtonBase-root.MuiCardActionArea-root.css-1m5f78l')
                if button:
                    await button.click()
                    print("Clicked quiz")

    buttons=None
    flag=True
    while flag or buttons:
        await page.waitFor(1000)

        # Find all button elements that contain the KeyboardArrowDownIcon SVG
        buttons = await new_tab.querySelectorAll('button svg[data-testid="KeyboardArrowDownIcon"]')
        print(f"{len(buttons)} found")
        # Click each of those buttons
        for button in buttons:
            await button.click()
            flag=False
    print("Expansion finished")
    await page.waitFor(5000) #wait for all questions loaded
    rows = await new_tab.querySelectorAll('main>div:nth-child(2)>div>div>table>tbody>tr') #Each table row is one test or quiz
    with open('questionBank.csv', 'w') as f:
        writer=csv.writer(f)
        writer.writerow(["Quiz title","HTML of the question","Answer","Options, separated by |","HTML of the explanation to the answer","Question type"])
        for i, row in enumerate(rows):
            print(i)
            if (i%2==0):
                span = await row.querySelector(':scope>th > span')  #make sure the table header is immediately after tr
                name = await new_tab.evaluate('(element) => element.textContent', span)
                print(name)
            else:
                div = await row.querySelectorAll('td > div > div > div > div > div > div')
                # test will have a extra row for displaying the test performance
                if name[-4:]=="Test":
                    index=2
                else:
                    index=1
                qs = await div[index].querySelectorAll(':scope> div') #search for all questions block
                for q in qs:
                    q_div = await q.querySelectorAll(':scope>div>div>div>div')# the target question (q_div[0]), answer and options(q_div[2]) and explanation(q_div[4]) div elements
                    question=await q_div[0].querySelector(':scope>div')
                    question_html=await new_tab.evaluate('(element) => element.innerHTML', question)#the whole HTML block for the question, including tables
                    answer_p=await q_div[2].querySelector(":scope>p")#look for answer <p> element, the correct answer sentence
                    answer=await new_tab.evaluate('(element) => element.textContent', answer_p)
                    options_ul=await q_div[2].querySelector("ul")#look for all options
                    options=await options_ul.querySelectorAll("li")#the option list
                    op_list = []
                    for op in options:
                        op_div = await op.querySelector("div:nth-child(2)")
                        text = await new_tab.evaluate('(element) => element.textContent', op_div)
                        op_list.append(text)
                    op_string = '|'.join(op.replace('|', r'\|') for op in op_list)  # Escape "|" with "\|"
                    explanation=await new_tab.evaluate('(element) => element.innerHTML', q_div[4])#the whole HTML block for the explanation
                    writer.writerow([name,question_html,answer[-1],op_string,explanation,"mc"])

    # Close the browser
    await browser.close()

# Run the script
asyncio.get_event_loop().run_until_complete(main())
