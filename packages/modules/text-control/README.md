# @proto.ui/module-text-control

Portable multiline text-control protocol for Proto UI adapters and prototypes.

## Purpose

Owns the host boundary for a declared native text control: stable controlled or uncontrolled value ownership, normalized input/change/IME composition events, live native-property projection, and physical focus access. It does not own labels, form submission, validation messages, rich text, or auto-resize policy.

## Package role

Adapter-facing dependency used by Base Textarea and official Web Component, React, and Vue adapters. Host integrations provide a `TextControlHost`; web hosts can use `createWebTextControlHost`.

## Install

```bash
npm install @proto.ui/module-text-control@0.2.0-rc.7
```

## Main exports

- `declareTextControl`
- `createTextControlModule`
- `createWebTextControlHost`
- `TEXT_CONTROL_HOST_CAP`
- `TEXT_CONTROL_RUN_IN_CALLBACK_CAP`
- `TextControlFacade`, `TextControlHost`, `TextControlPatch`, and normalized event types

## Related packages

- `@proto.ui/core`
- `@proto.ui/module-base`
- `@proto.ui/prototypes-base`
- `@proto.ui/types`

## License

MIT
