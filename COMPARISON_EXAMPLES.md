# Comparison Functions - Example Responses

## JSON Compare

### Example 1: No Differences Found

**Input:**
```json
{
  "name": "John",
  "age": 30
}
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF
- Ignore Key Order: OFF

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "differencesCount": 0,
  "diffLines": []
}
```

### Example 2: Differences Found

**Input 1:**
```json
{
  "name": "John",
  "age": 30
}
```

**Input 2:**
```json
{
  "name": "Jane",
  "age": 30,
  "city": "NYC"
}
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF
- Ignore Key Order: OFF

**Response:**
```json
{
  "areEqual": false,
  "differences": [
    {
      "type": "modified",
      "path": "name",
      "oldValue": "John",
      "newValue": "Jane",
      "message": "Value changed: \"John\" → \"Jane\""
    },
    {
      "type": "added",
      "path": "city",
      "newValue": "NYC",
      "message": "Added key: city"
    }
  ],
  "differencesCount": 2,
  "diffLines": [
    {
      "lineNumber": 1,
      "left": "{",
      "right": "{",
      "type": "unchanged"
    },
    {
      "lineNumber": 2,
      "left": "  \"name\": \"John\",",
      "right": "  \"name\": \"Jane\",",
      "type": "modified"
    },
    {
      "lineNumber": 3,
      "left": "  \"age\": 30",
      "right": "  \"age\": 30,",
      "type": "modified"
    },
    {
      "lineNumber": 4,
      "right": "  \"city\": \"NYC\"",
      "type": "added"
    },
    {
      "lineNumber": 5,
      "left": "}",
      "right": "}",
      "type": "unchanged"
    }
  ]
}
```

### Example 3: Ignore Key Order

**Input 1:**
```json
{"b": 2, "a": 1}
```

**Input 2:**
```json
{"a": 1, "b": 2}
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF
- Ignore Key Order: **ON**

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "differencesCount": 0,
  "diffLines": []
}
```

### Example 4: Ignore Whitespace

**Input 1:**
```json
{"name": "  John  Doe  "}
```

**Input 2:**
```json
{"name": "John Doe"}
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: **ON**
- Ignore Key Order: OFF

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "differencesCount": 0,
  "diffLines": []
}
```

### Example 5: Case Insensitive

**Input 1:**
```json
{"Name": "John"}
```

**Input 2:**
```json
{"name": "john"}
```

**Options:**
- Case Sensitive: **OFF**
- Ignore Whitespace: OFF
- Ignore Key Order: OFF

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "differencesCount": 0,
  "diffLines": []
}
```

---

## XML Compare

### Example 1: No Differences Found

**Input:**
```xml
<user id="1"><name>John</name></user>
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF
- Ignore Attribute Order: OFF

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "differencesCount": 0,
  "diffLines": []
}
```

### Example 2: Differences Found

**Input 1:**
```xml
<user id="1" role="admin">
  <name>John</name>
</user>
```

**Input 2:**
```xml
<user id="2" role="user">
  <name>Jane</name>
  <email>jane@example.com</email>
</user>
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF
- Ignore Attribute Order: OFF

**Response:**
```json
{
  "areEqual": false,
  "differences": [
    {
      "type": "attribute_changed",
      "path": "/user",
      "element": "user",
      "attribute": "id",
      "oldValue": "1",
      "newValue": "2",
      "message": "Attribute changed: id=\"1\" → \"2\""
    },
    {
      "type": "attribute_changed",
      "path": "/user",
      "element": "user",
      "attribute": "role",
      "oldValue": "admin",
      "newValue": "user",
      "message": "Attribute changed: role=\"admin\" → \"user\""
    },
    {
      "type": "modified",
      "path": "/user/name",
      "element": "name",
      "oldValue": "John",
      "newValue": "Jane",
      "message": "Text content changed: \"John\" → \"Jane\""
    },
    {
      "type": "added",
      "path": "/user/email",
      "element": "email",
      "newValue": "jane@example.com",
      "message": "Element added: email at /user/email"
    }
  ],
  "differencesCount": 4,
  "diffLines": [
    {
      "lineNumber": 1,
      "left": "<user id=\"1\" role=\"admin\">",
      "right": "<user id=\"2\" role=\"user\">",
      "type": "modified"
    },
    {
      "lineNumber": 2,
      "left": "  <name>John</name>",
      "right": "  <name>Jane</name>",
      "type": "modified"
    },
    {
      "lineNumber": 3,
      "right": "  <email>jane@example.com</email>",
      "type": "added"
    },
    {
      "lineNumber": 4,
      "left": "</user>",
      "right": "</user>",
      "type": "unchanged"
    }
  ]
}
```

### Example 3: Ignore Attribute Order

**Input 1:**
```xml
<user id="1" name="John"/>
```

**Input 2:**
```xml
<user name="John" id="1"/>
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF
- Ignore Attribute Order: **ON**

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "differencesCount": 0,
  "diffLines": []
}
```

### Example 4: Ignore Whitespace

**Input 1:**
```xml
<user>
  <name>  John  </name>
</user>
```

**Input 2:**
```xml
<user><name>John</name></user>
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: **ON**
- Ignore Attribute Order: OFF

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "differencesCount": 0,
  "diffLines": []
}
```

---

## Text Compare

### Example 1: No Differences Found

**Input:**
```
Line 1
Line 2
Line 3
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "totalChanges": 0,
  "differencesCount": 0,
  "diffLines": [
    {
      "lineNumber": 1,
      "left": "Line 1",
      "right": "Line 1",
      "type": "unchanged"
    },
    {
      "lineNumber": 2,
      "left": "Line 2",
      "right": "Line 2",
      "type": "unchanged"
    },
    {
      "lineNumber": 3,
      "left": "Line 3",
      "right": "Line 3",
      "type": "unchanged"
    }
  ]
}
```

### Example 2: Differences Found

**Input 1:**
```
Line 1
Line 2
Line 3
```

**Input 2:**
```
Line 1
Line 2 Modified
Line 4
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: OFF

**Response:**
```json
{
  "areEqual": false,
  "differences": [
    {
      "type": "unchanged",
      "line": 1,
      "content": "Line 1"
    },
    {
      "type": "removed",
      "line": 2,
      "content": "Line 2"
    },
    {
      "type": "added",
      "line": 2,
      "content": "Line 2 Modified"
    },
    {
      "type": "removed",
      "line": 3,
      "content": "Line 3"
    },
    {
      "type": "added",
      "line": 4,
      "content": "Line 4"
    }
  ],
  "totalChanges": 4,
  "differencesCount": 4,
  "diffLines": [
    {
      "lineNumber": 1,
      "left": "Line 1",
      "right": "Line 1",
      "type": "unchanged"
    },
    {
      "lineNumber": 2,
      "left": "Line 2",
      "right": "Line 2 Modified",
      "type": "modified"
    },
    {
      "lineNumber": 3,
      "left": "Line 3",
      "type": "removed"
    },
    {
      "lineNumber": 4,
      "right": "Line 4",
      "type": "added"
    }
  ]
}
```

### Example 3: Ignore Whitespace

**Input 1:**
```
Line  1
  Line  2
```

**Input 2:**
```
Line 1
Line 2
```

**Options:**
- Case Sensitive: ON
- Ignore Whitespace: **ON**

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "totalChanges": 0,
  "differencesCount": 0,
  "diffLines": []
}
```

### Example 4: Case Insensitive

**Input 1:**
```
Hello World
TEST
```

**Input 2:**
```
hello world
test
```

**Options:**
- Case Sensitive: **OFF**
- Ignore Whitespace: OFF

**Response:**
```json
{
  "areEqual": true,
  "differences": [],
  "totalChanges": 0,
  "differencesCount": 0,
  "diffLines": []
}
```

---

## Implementation Notes

1. **All normalization happens BEFORE comparison** - inputs are canonicalized according to options, then compared
2. **Line-by-line diff is computed on canonicalized serialized outputs** - provides accurate visual diff
3. **Structured differences provide detailed change information** - includes paths, old/new values, and messages
4. **Options reset comparison state** - changing options clears results and requires re-comparison
5. **Results only appear after Compare button click** - no auto-comparison for better UX

