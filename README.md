# shtable

> Finally, table with static head.

# Install
You can get it on bower.

```shell
bower install shtable --save
```
and
```html
<script src="../shtable/dist/shtable.min.js"></script>
```

# Usage

```html
<div>
    <table id="table">
        <thead>
            <tr>
                <th class='handle'>header1</th>
                <th class='handle'>header2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>conten1</td>
                <td>conten2</td>
            </tr>
        </tbody>
    </table>
</div>
```

```js
var shtable = $('#table').shtable(options);
```

# Options

#### `styleContainer`
- Setting `container` for style tag

# License
MIT