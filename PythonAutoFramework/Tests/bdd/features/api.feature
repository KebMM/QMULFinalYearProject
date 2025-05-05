Feature: API Testing

  Scenario: Allure w behave
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the status code should be 200
    And the response JSON should be
      """
      {
        "userId": 1,
        "id": 1,
        "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
      }
      """

  Scenario: Test POST Request
    Given the API is available
    When we send a POST request to "https://jsonplaceholder.typicode.com/posts" with body
      """
      {
        "title": "foo",
        "body": "bar",
        "userId": 1
      }
      """
    Then the status code should be 201
    And the response JSON should contain
      """
      {
        "title": "foo",
        "body": "bar",
        "userId": 1
      }
      """

  Scenario: Test DELETE Request
    Given the API is available
    When we send a DELETE request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the status code should be 200

  Scenario: Test PUT Request
    Given the API is available
    When we send a PUT request to "https://jsonplaceholder.typicode.com/posts/1" with body
      """
      {
        "id": 1,
        "title": "foo",
        "body": "bar",
        "userId": 1
      }
      """
    Then the status code should be 200
    And the response JSON should contain
      """
      {
        "id": 1,
        "title": "foo",
        "body": "bar",
        "userId": 1
      }
      """

  Scenario: Test PATCH Request
    Given the API is available
    When we send a PATCH request to "https://jsonplaceholder.typicode.com/posts/1" with body
      """
      {
        "title": "foo"
      }
      """
    Then the status code should be 200
    And the response JSON should contain
      """
      {
        "title": "foo"
      }
      """

  Scenario: Test HEAD Request
    Given the API is available
    When we send a HEAD request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the status code should be 200

  Scenario: Test OPTIONS Request
    Given the API is available
    When we send an OPTIONS request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the status code should be 204

  Scenario: Test Response Headers
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the response headers should contain
      """
      {
        "Content-Type": "application/json; charset=utf-8"
      }
      """

  Scenario: Test JSON Schema
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the response should match the JSON schema
      """
      {
        "type": "object",
        "properties": {
          "userId": { "type": "integer" },
          "id": { "type": "integer" },
          "title": { "type": "string" },
          "body": { "type": "string" }
        },
        "required": ["userId", "id", "title", "body"]
      }
      """

  Scenario: Test Response Time
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the response time should be less than 2000 ms

  Scenario: Test Response Contains Key
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the response should contain key "title"

  Scenario: Test GET Request with Auth
    Given the API is available
    When we send a cheeky GET request to "https://jsonplaceholder.typicode.com/posts/1" with token "your_token_here"
    Then the status code should be 200
    And the response JSON should contain
      """
      {
        "userId": 1,
        "id": 1,
        "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
      }
      """

  Scenario: Test POST Request with Auth
    Given the API is available
    When we send a POST request to "https://jsonplaceholder.typicode.com/posts" with body and token "your_token_here"
      """
      {
        "title": "foo",
        "body": "bar",
        "userId": 1
      }
      """
    Then the status code should be 201
    And the response JSON should contain
      """
      {
        "title": "foo",
        "body": "bar",
        "userId": 1
      }
      """

  Scenario: Test Pagination
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts"
    Then the response pagination should have a page size of 100

  Scenario: Test Sorting
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts"
    Then the response should be sorted by "id" in "asc" order

  Scenario: Test File Upload
    Given the API is available
    When we upload a file to "https://jsonplaceholder.typicode.com/posts" with path "C:\Users\kebba.mm\OneDrive - Infuse Consulting Limited\Python auto-framework\commonSteps.txt"
    Then the status code should be 201

  Scenario: Test Response Structure
    Given the API is available
    When we send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the response structure should match
      """
      {
        "userId": 1,
        "id": 1,
        "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
      }
      """
