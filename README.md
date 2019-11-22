# shtable

> Table with static left columns and/or rows of head.

# Install
You can get it on bower.

```shell
bower install shtable --save
```
and
```html
<script src="./bower_components/shtable/dist/shtable.min.js"></script>
```

# Usage

Simple html.
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
- Default: `head`.
- Setting `container` selector for style tag.

#### `offsetTop`
- Default: `0`.
- Setting `position` for place of static rows/columns of the table (if you have a top static menu or other top static element). 

#### `offsetBottom`
- Default: `0`.
- Setting default `position` for place static bottom scrollbar of the table (if you have other bottom static element).

#### `horizontalScrollHeight`
- Default: `15`.
- Setting `height` for container of bottom static scrollbar.

#### `depth`
- Default: `1`.
- Setting `depth` for left static columns of the table.

#### `horizontalHead`
- Default: `true`.
- Setting `off/on` state of top static rows of table.

#### `combinationHead`
- Default: `true`.
- Setting `off/on` state of left top static area of table.

#### `verticalHead`
- Default: `false`.
- Setting `off/on` state of left static columns of table.

#### `horizontalScroll`
- Default: `true`.
- Setting `off/on` state of bottom static scrollbar container of table.

#### `mainContainerClasses`
- Default: ``.
- Setting `classes` for `mainContainer` element.

#### `mainWrapClasses`
- Default: ``.
- Setting `classes` for `mainWrap` element.

#### `mainTableInnerClasses`
- Default: ``.
- Setting `classes` for `mainTableInner` element.

#### `mainTableWrapClasses`
- Default: ``.
- Setting `classes` for `mainTableWrap` element.

#### `horizontalHeadContainerClasses`
- Default: ``.
- Setting `classes` for `horizontalHeadContainer` element.

#### `horizontalHeadTableWrapClasses`
- Default: ``.
- Setting `classes` for `horizontalHeadTableWrap` element.

#### `horizontalHeadTableClasses`
- Default: ``.
- Setting `classes` for `horizontalHeadTable` element.

#### `combinationHeadContainerClasses`
- Default: ``.
- Setting `classes` for `combinationHeadContainer` element.

#### `combinationHeadTableWrapClasses`
- Default: ``.
- Setting `classes` for `combinationHeadTableWrap` element.

#### `combinationHeadTableClasses`
- Default: ``.
- Setting `classes` for `combinationHeadTable` element.

#### `verticalHeadContainerClasses`
- Default: ``.
- Setting `classes` for `verticalHeadContainer` element.

#### `verticalHeadTableWrapClasses`
- Default: ``.
- Setting `classes` for `verticalHeadTableWrap` element.

#### `verticalHeadTableClasses`
- Default: ``.
- Setting `classes` for `verticalHeadTable` element.

#### `horizontalScrollContainerClasses`
- Default: ``.
- Setting `classes` for `horizontalScrollContainer` element.

#### `horizontalScrollContentClasses`
- Default: ``.
- Setting `classes` for `horizontalScrollContent` element.

# Methods

#### `setOffsetTop`
- Update `offsetTop` option.
- I use: `shtable.actions.setOffsetTop(50);`

#### `setOffsetBottom`
- Update `offsetBottom` option.
- I use: `shtable.actions.setOffsetBottom(50);`

#### `addListener`
- Set listener of event.
- I use: `shtable.actions.addListener('resize', function (data) {});`
- Events: `resize`, `verticalScroll`, `horizontalScroll`

#

Example:

```js
var shtable = $('#table').shtable({
    horizontalHeadTableClasses: 'table table-bordered',
    combinationHeadTableClasses: 'table table-bordered',
    verticalHeadTableClasses: 'table table-bordered',
    offsetTop: $(window).width() >= 980 ? 52 : 0, // fixed header offset
    offsetBottom: 0
});

shtable.actions.addListener('resize', function (data) {
    shtable.actions.setOffsetTop($(window).width() >= 980 ? 52 : 0);
});
```

# License
MIT
