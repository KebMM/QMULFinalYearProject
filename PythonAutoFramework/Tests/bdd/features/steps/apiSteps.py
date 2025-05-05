import json
from behave import given, when, then
import importlib
import os
import allure

# Path to the commonAPISteps.py
common_api_steps_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../apiAutomation/commonAPISteps.py'))

# Load the module
spec = importlib.util.spec_from_file_location("commonAPISteps", common_api_steps_path)
commonAPISteps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(commonAPISteps)

response = None

@allure.feature('API Testing')
@allure.story('Check API Availability')
@given('the API is available')
def step_impl(context):
    pass

@allure.step('Send GET request to {url}')
@when('we send a GET request to "{url}"')
def step_impl(context, url):
    global response
    response = commonAPISteps.CommonApiSteps.send_get_request(url)

@allure.step('Verify status code is {status_code}')
@then('the status code should be {status_code:d}')
def step_impl(context, status_code):
    commonAPISteps.CommonApiSteps.check_status_code(response, status_code)

@then('the response JSON should be')
def step_impl(context):
    expected_json = json.loads(context.text)
    commonAPISteps.CommonApiSteps.check_response_json(response, expected_json)

@when('we send a POST request to "{url}" with body')
def step_impl(context, url):
    global response
    body = json.loads(context.text)
    response = commonAPISteps.CommonApiSteps.send_post_request(url, json=body)

@then('the response JSON should contain')
def step_impl(context):
    expected_json = json.loads(context.text)
    actual_json = response.json()
    for key, value in expected_json.items():
        assert actual_json[key] == value, f"Expected {key} to be {value}, but got {actual_json[key]}"

@when('we send a DELETE request to "{url}"')
def step_impl(context, url):
    global response
    response = commonAPISteps.CommonApiSteps.send_delete_request(url)

@when('we send a PUT request to "{url}" with body')
def step_impl(context, url):
    global response
    body = json.loads(context.text)
    response = commonAPISteps.CommonApiSteps.send_put_request(url, json=body)

@when('we send a PATCH request to "{url}" with body')
def step_impl(context, url):
    global response
    body = json.loads(context.text)
    response = commonAPISteps.CommonApiSteps.send_patch_request(url, json=body)

@when('we send a HEAD request to "{url}"')
def step_impl(context, url):
    global response
    response = commonAPISteps.CommonApiSteps.send_head_request(url)

@when('we send an OPTIONS request to "{url}"')
def step_impl(context, url):
    global response
    response = commonAPISteps.CommonApiSteps.send_options_request(url)

@then('the response headers should contain')
def step_impl(context):
    expected_headers = json.loads(context.text)
    commonAPISteps.CommonApiSteps.check_response_headers(response, expected_headers)

@then('the response should match the JSON schema')
def step_impl(context):
    schema = json.loads(context.text)
    commonAPISteps.CommonApiSteps.validate_json_schema(response, schema)

@then('the response time should be less than {max_response_time:d} ms')
def step_impl(context, max_response_time):
    commonAPISteps.CommonApiSteps.validate_response_time(response, max_response_time)

@then('the response should contain key "{key}"')
def step_impl(context, key):
    commonAPISteps.CommonApiSteps.validate_response_contains_key(response, key)

@when('we send a cheeky GET request to "{url}" with token "{token}"')
def step_impl(context, url, token):
    global response
    response = commonAPISteps.CommonApiSteps.send_get_request_with_auth(url, token)

@when('we send a POST request to "{url}" with body and token "{token}"')
def step_impl(context, url, token):
    global response
    body = json.loads(context.text)
    response = commonAPISteps.CommonApiSteps.send_post_request_with_auth(url, json=body, token=token)

@then('the response pagination should have a page size of {page_size:d}')
def step_impl(context, page_size):
    commonAPISteps.CommonApiSteps.validate_pagination(response, page_size)

@then('the response should be sorted by "{key}" in "{order}" order')
def step_impl(context, key, order):
    commonAPISteps.CommonApiSteps.validate_sorting(response, key, order)

@when('we upload a file to "{url}" with path "{file_path}"')
def step_impl(context, url, file_path):
    global response
    response = commonAPISteps.CommonApiSteps.api_file_upload(url, file_path)

@then('the response structure should match')
def step_impl(context):
    structure = json.loads(context.text)
    commonAPISteps.CommonApiSteps.validate_response_structure(response, structure)
