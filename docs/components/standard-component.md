# standard-component

Wow! This component is awesome.



## Example

<kly-form schema={{
  "title": "Customer Profile",
  "description": "...",
  "type": "object",
  "properties": {
    "text": {
      "title": "Text",
      "description": "Enter your text",
      "type": "string",
      "widget": {
        "props": {
          "class": "form-control",
          "labelable": false,
          "some": 12
        }
      }
    }
  }
}} />

## Source Code

<<< @/src/components/KlyForm.vue

## PHP

``` php{4}
<?php

$var = 'some';
echo "sum";

exit();
```

## slots

...

## props

...