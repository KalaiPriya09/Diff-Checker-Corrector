// Sample data for different validation and comparison types

export const JSON_SAMPLE = `{
  "name": "John Doe",
  "age": 30,
  "email": "john.doe@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "isActive": true,
  "metadata": {
    "createdAt": "2024-01-15T10:30:00Z",
    "lastUpdated": "2024-01-20T15:45:00Z"
  }
}`;

export const XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<person>
  <name>John Doe</name>
  <age>30</age>
  <email>john.doe@example.com</email>
  <address>
    <street>123 Main St</street>
    <city>New York</city>
    <state>NY</state>
    <zipCode>10001</zipCode>
  </address>
  <hobbies>
    <hobby>reading</hobby>
    <hobby>swimming</hobby>
    <hobby>coding</hobby>
  </hobbies>
  <isActive>true</isActive>
  <metadata>
    <createdAt>2024-01-15T10:30:00Z</createdAt>
    <lastUpdated>2024-01-20T15:45:00Z</lastUpdated>
  </metadata>
</person>`;

export const JSON_COMPARE_LEFT_SAMPLE = `{
  "name": "John Doe",
  "age": 30,
  "email": "john.doe@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "swimming", "coding"]
}`;

export const JSON_COMPARE_RIGHT_SAMPLE = `{
  "name": "Jane Smith",
  "age": 28,
  "email": "jane.smith@example.com",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001"
  },
  "hobbies": ["reading", "photography", "traveling"]
}`;

export const XML_COMPARE_LEFT_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<person>
  <name>John Doe</name>
  <age>30</age>
  <email>john.doe@example.com</email>
  <address>
    <street>123 Main St</street>
    <city>New York</city>
    <state>NY</state>
    <zipCode>10001</zipCode>
  </address>
  <hobbies>
    <hobby>reading</hobby>
    <hobby>swimming</hobby>
    <hobby>coding</hobby>
  </hobbies>
</person>`;

export const XML_COMPARE_RIGHT_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<person>
  <name>Jane Smith</name>
  <age>28</age>
  <email>jane.smith@example.com</email>
  <address>
    <street>456 Oak Ave</street>
    <city>Los Angeles</city>
    <state>CA</state>
    <zipCode>90001</zipCode>
  </address>
  <hobbies>
    <hobby>reading</hobby>
    <hobby>photography</hobby>
    <hobby>traveling</hobby>
  </hobbies>
</person>`;

export const TEXT_COMPARE_LEFT_SAMPLE = `The quick brown fox jumps over the lazy dog.
This is a sample text for comparison.
Line three contains some unique content.
Here is another line of text.
The final line completes the sample.`;

export const TEXT_COMPARE_RIGHT_SAMPLE = `The quick brown fox jumps over the lazy dog.
This is a different text for comparison.
Line three contains some modified content.
Here is an additional line of text.
The final line completes the sample.
This is a new line at the end.`;

