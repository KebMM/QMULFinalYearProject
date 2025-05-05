Feature: Sample test for web UI

  Scenario: Open browser and navigate to demo website
    Given the browser is open
    When we navigate to "https://practise.usemango.co.uk/"
    Then the title should be "Demo Website"

  Scenario: Add product to basket
    Given the browser is open
    When we navigate to "https://practise.usemango.co.uk/"
    When we go to the "Products" page
    When we click the search bar and enter the product name
    When we add the product to the basket
    When we go to the basket
    Then the basket should contain the item
