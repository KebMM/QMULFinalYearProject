## UI Custom Component Descriptions

**Launch Web Browser (launch_web_browser):** <br/>
This command launches a web browser and navigates to a specified URL using the provided driver instance. For example: ```commonUISteps.CommonUISteps.launch_web_browser(driver, "http://example.com") ```

**Click Component (click):** <br/>
The `Click` command ensures an element is visible before clicking it. It simplifies the click action by bundling the visibility check and click action together, which is useful for ensuring interactions are performed only on visible elements.

**Click with Actions (click_with_actions):** <br/>
This command uses ActionChains to perform a click on the specified element, which can be useful for complex interactions like mouse movements and key presses.

**Double Click (double_click_with_actions):** <br/>
This command performs a double-click action on the specified element. The element can be identified using web locator

**Click with Timeout (click_with_timeout):** <br/>
Waits for an element to become visible within a specified timeout period before clicking on it. The time (in seconds) should be specified as a parameter when calling the method. For example:
```CommonUISteps.click_with_timeout(driver, element, 10)```

**Right Click with Actions (right_click_with_actions):** <br/>
Performs a right-click action on the specified element

**Click Coordinates (click_coordinates):** <br/>
Clicks on the screen at the specified (x, y) coordinates. These coordinates are passed in as parameters when calling the method. For example:
```CommonUISteps.click_coordinates(867, 847)```

**Click and Hold (click_and_hold):** <br/>
Clicks and holds the mouse button on the specified element

**Release Element (release_element):** <br/>
Releases the mouse button that was clicked and held on an element

**Send Text (send_text):** <br/>
Sends the specified text to the element. Both the element and the text are passed in as parameters. For example: ```CommonUISteps.send_text(input_element, "Hello, world!")```

**Get Elements Text (get_elements_text):** <br/>
This command retrieves the text from all elements matching the specified locator and logs the text.

**Verify Element Displayed (verify_element_displayed):** <br/>
This step passes if the specified element is visible on the screen. The timeout period can be adjusted by editing the timeout parameter to your desired timeout period. The method can be called in a test as so: ```CommonUISteps.verify_element_displayed(context, (By.XPATH, "element's xpath"), timeout=timeout value)```

**Verify Element Not Displayed (verify_element_not_displayed):** <br/>
This step passes if the specified element is not displayed within a specified timeout period. The timeout period can be adjusted by editing the timeout parameter to your desired timeout period. The method can be called in a test as so: ```CommonUISteps.verify_element_not_displayed(context, (By.XPATH, "element's xpath"), timeout=timout value)```

**Move Mouse to Coordinates (move_mouse_to_coordinates):** <br/>
Moves mouse to specified coordinates (x,y). ```CommonUISteps.move_mouse_to_coordinates(867, 847)```

**Scroll to Element (scroll_to_element):** <br/>
This command scrolls the web page until the specified element is in view. The element identifier is passed in as a parameter when calling the method, as so ```CommonUISteps.scroll_to_element(context, element)```

**Scroll Down by Pixels (scroll_down_by_pixels):** <br/>
This command scrolls down the web page by the specified number of pixels. The number of pixels are passed in when calling the method. For example: ``` CommonUISteps.scroll_down_by_pixels(context, 300)```

**Scroll Up by Pixels (scroll_up_by_pixels):**
This command scrolls up the web page by the specified number of pixels. The number of pixels are passed in when calling the method. For example: ``` CommonUISteps.scroll_up_by_pixels(context, 300)```

**Scroll to Bottom (scroll_to_bottom):** <br/>
This component scrolls to the bottom of the web page. Component called by running: ```CommonUISteps.scroll_to_bottom(context)```

**Scroll to Top (scroll_to_top):** <br/>
This component scrolls to the top of the web page. Component called by running: ```CommonUISteps.scroll_to_top(context)```

**Hover Over Element (hover_over_element):** <br/>
This component moves the mouse pointer over the specified element. Component called by running: ```CommonUISteps.hover_over_element(context, element)```

**Set Attribute (set_attribute):** <br/>
This component sets an attribute of the specified element to a given value using JavaScript. The "attribute_name" and "attribute_value" are passed as arguments and the component can be called as so: ```CommonUISteps.set_attribute(context, link_element, "data-test", "wikipedia-portals-link")```

**Highlight Element (highlight_element):** <br/>
This component highlights an element by changing its style temporarily, useful for debugging. Called by running: ```CommonUISteps.highlight_element(context, element)```

**Select Checkbox (select_checkbox):** <br/>
This component selects or deselects a checkbox element based on the specified boolean value. Called by running ```CommonUISteps.select_checkbox(checkbox, True)```

**Select Dropdown by Text (select_dropdown_by_text):** <br/>
This component opens a dropdown and selects the option based on the text. The dropdown is found using an identifier.

**Accept Alert (accept_alert):** <br/>
This component accepts a browser alert if present. ```CommonUISteps.accept_alert(context.driver.switch_to.alert)```

**Dismiss Alert (dismiss_alert):** <br/>
This component dismisses a browser alert if present. ```CommonUISteps.dismiss_alert(context.driver.switch_to.alert)```

**Get Alert Text (get_alert_text):** <br/>
This component retrieves the text from a browser alert if present. ```commonUISteps.CommonUISteps.get_alert_text(context)```

**Send Alert Text (send_alert_text):** <br/>
This component sends text to a browser alert and accepts it. ```CommonUISteps.send_alert_text(context, text)```

**Switch to Frame (switch_to_frame):** <br/>
This component switches the browser context to the specified frame by name or ID. ```CommonUISteps.switch_to_frame(context, frame_name_or_id)```

**Switch to Child Window (switch_to_child_window):** <br/>
This component switches the browser context to a child window.

**Get Validation Error Message (get_validation_error_message):** <br/>
This component retrieves the validation error message from an element.

**Take Screenshot (take_screenshot):** <br/>
This component takes a screenshot of the current browser window and saves it with the specified filename. ```CommonUISteps.take_screenshot(driver, filename)```

**Wait for (wait_for):** <br/>
This component waits for the specified number of seconds. ```CommonUISteps.wait_for(seconds)```

**Wait for Visibility (wait_for_visibility):** <br/>
This component waits for the specified element to be visible within the given timeout period.

**Wait for Visibility by Locator (wait_for_visibility_by):** <br/>
This component waits for the specified element located by a locator to be visible within the given timeout period. The element and the timeout period are passed as arguments, for example: ``` CommonUISteps.wait_for_visibility(driver, element, timeout)```

**Wait for Clickability (wait_for_clickability):** <br/>
This component waits for the specified element located by a locator to be clickable within the given timeout period. ```CommonUISteps.wait_for_visibility_by(driver, locator, timeout)```

**Wait for Presence of Element (wait_for_presence_of_element):** <br/>
This component waits for the specified element located by a locator to be present in the DOM within the given timeout period. ```CommonUISteps.wait_for_presence_of_element(driver, locator, time)```

**Wait for Page to Load (wait_for_page_to_load):** <br/>
This component waits for the page to fully load within the specified timeout period. ```CommonUISteps.wait_for_page_to_load(driver, timeout)```

**Is Element Available (is_element_available):** <br/>
This component checks if an element is available and visible on the page. ```CommonUISteps.is_element_available(driver, element)```

**Read Image File (read_image_file):** <br/>
This component reads an image file from the specified path and returns it as a BufferedImage. ```CommonUISteps.read_image_file(image_name)```

**Are Images Similar (are_images_similar):** <br/>
This component compares two images by pixels to determine if they are similar within a specified tolerance (%). If the simalarity is above the tolerance threshold it is regarded as similar. The threshold is set in the parameters of the "images_similar" method located in "commonUISteps.py", and can be changed by editing the value (set by default to 3%). The image paths are passed in when calling the method, for example: ```CommonUISteps.are_images_similar(actual_image_path, expected_image_path)```

**Click on Image (click_on_image):** <br/>
This component locates an image from the user's filesystem and clicks on an image on the screen. It has a timeout parameter set to 5 (seconds) by default but can be set to a different value.


## API Custom Component Descriptions
**Send GET Request (send_get_request):** <br/>
This component sends a GET request to the specified URL with optional headers and parameters. It returns the response object.
Example usage: ```CommonApiSteps.send_get_request(url, headers=headers, params=params)```

**Send POST Request (send_post_request):** <br/>
This component sends a POST request to the specified URL with optional headers, data, and JSON payload. It returns the response object.
Example usage: ```CommonApiSteps.send_post_request(url, headers=headers, data=data, json=json)```

**Send PUT Request (send_put_request):** <br/>
This component sends a PUT request to the specified URL with optional headers, data, and JSON payload. It returns the response object.
Example usage: ```CommonApiSteps.send_put_request(url, headers=headers, data=data, json=json)```

**Send DELETE Request (send_delete_request):** <br/>
This component sends a DELETE request to the specified URL with optional headers and data. It returns the response object.
Example usage: ```CommonApiSteps.send_delete_request(url, headers=headers, data=data)```

**Send PATCH Request (send_patch_request):** <br/>
This component sends a PATCH request to the specified URL with optional headers, data, and JSON payload. It returns the response object.
Example usage: ```CommonApiSteps.send_patch_request(url, headers=headers, data=data, json=json)```

**Send HEAD Request (send_head_request):** <br/>
This component sends a HEAD request to the specified URL with optional headers. It returns the response object.
Example usage: ```CommonApiSteps.send_head_request(url, headers=headers)```

**Send OPTIONS Request (send_options_request):** <br/>
This component sends an OPTIONS request to the specified URL with optional headers. It returns the response object.
Example usage: ```CommonApiSteps.send_options_request(url, headers=headers)```

**Send GET Request with Auth (send_get_request_with_auth):** <br/>
This component sends a GET request to the specified URL with an authorization token and optional headers. It returns the response object.
Example usage: ```CommonApiSteps.send_get_request_with_auth(url, token, headers=headers)```

**Send POST Request with Auth (send_post_request_with_auth):** <br/>
This component sends a POST request to the specified URL with an authorization token, optional data, JSON payload, and headers. It returns the response object.
Example usage: ```CommonApiSteps.send_post_request_with_auth(url, data=data, json=json, token=token, headers=headers)```

**Check Status Code (check_status_code):** <br/>
This component checks if the response status code matches the expected status code. If not, it raises an assertion error.
Example usage: ```CommonApiSteps.check_status_code(response, expected_status)```

**Check Response JSON (check_response_json):** <br/>
This component checks if the response JSON matches the expected JSON. If not, it raises an assertion error.
Example usage: ```CommonApiSteps.check_response_json(response, expected_json)```

**Check Response Headers (check_response_headers):** <br/>
This component checks if the response headers contain the expected headers and values. If not, it raises an assertion error.
Example usage: ```CommonApiSteps.check_response_headers(response, expected_headers)```

**Validate JSON Schema (validate_json_schema):** <br/>
This component validates the response JSON against a specified JSON schema. If the validation fails, it raises an assertion error.
Example usage: ```CommonApiSteps.validate_json_schema(response, schema)```

**Validate Response Time (validate_response_time):** <br/>
This component checks if the response time is less than the specified maximum response time (in milliseconds). If not, it raises an assertion error.
Example usage: ```CommonApiSteps.validate_response_time(response, max_response_time)```

**Validate Response Contains Key (validate_response_contains_key):** <br/>
This component checks if the response JSON contains a specified key. If not, it raises an assertion error. Example usage: ```CommonApiSteps.validate_response_contains_key(response, key)```

**Validate Pagination (validate_pagination):** <br/>
This component checks if the response JSON contains at most a specified number of items, ensuring proper pagination. If not, it raises an assertion error.
Example usage: ```CommonApiSteps.validate_pagination(response, page_size)```

**Validate Sorting (validate_sorting):** <br/>
This component checks if the items in the response JSON are sorted by a specified key in the given order (ascending or descending). If not, it raises an assertion error.
Example usage: ```CommonApiSteps.validate_sorting(response, key, order='asc')```

**API File Upload (api_file_upload):** <br/>
This component uploads a file to a specified URL with optional headers. It returns the response object.
Example usage: CommonApiSteps.api_file_upload(url, file_path, headers=headers)

**Validate Response Structure (validate_response_structure):** <br/>
This component checks if the response JSON has the specified structure (set of keys). If not, it raises an assertion error.
Example usage: ```CommonApiSteps.validate_response_structure(response, structure)```


## Mobile Custom Component Descriptions

**Wait for Element (wait_for_element):** <br/>
This component waits for a specified element located by a given locator strategy to be present within the given timeout period.
Example usage: ```CommonMobileSteps.wait_for_element(AppiumBy.ID, locator)```

**Click Element (click_element):** <br/>
This component clicks on an element located by a specified locator strategy.
Example usage: ```CommonMobileSteps.click_element(AppiumBy.ID, locator) ```

**Send Text (send_text):** <br/>
This component sends the provided text to an element located by a specified locator strategy.
Example usage: ```CommonMobileSteps.send_element_text(AppiumBy.XPATH, locator, 'Sample Text') ```

**Get Element Text (get_element_text):** <br/>
This component retrieves and returns the text of an element located by a specified locator strategy.
Example usage: ```CommonMobileSteps.get_element_text(AppiumBy.XPATH, locator) ```


**Take Screenshot (take_screenshot)** <br/>
This component takes a screenshot of the current screen and saves it with the specified file name.
Example usage: ```CommonMobileSteps.take_screenshot(file_name)```


**Scroll to Element (scroll_to_element):** <br/>
This component scrolls to an element located by a specified locator strategy, but does not support XPath locators. It supports resource-id, text, or description locators for Android.
Example usage: ```CommonMobileSteps.scroll_to_element(AppiumBy.ANDROID_UIAUTOMATOR, locator)```
