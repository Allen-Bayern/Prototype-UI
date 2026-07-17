# Dropdown v0 contract (superseded)

This document is retained only as a historical index for the pre-catalogue dropdown implementation. It is not a normative source for Proto UI 0.2.

The canonical dropdown-menu contract is now split across these P entities:

- `P-BASE-DROPDOWN-MENU`
- `P-BASE-DROPDOWN-MENU-TRIGGER`
- `P-BASE-DROPDOWN-MENU-CONTENT`
- `P-BASE-DROPDOWN-MENU-ITEM`

Those entities define the current family anatomy, open-state protocol, overlay and transition composition, anchored positioning, collection navigation, typeahead, focus restoration, item activation, and disabled-item behavior. Their linked T entities and executable tests are the verification source.

The original v0 boundary deliberately excluded portal relocation, typeahead, and complete menu-button keyboard behavior. Those exclusions no longer describe the implementation and MUST NOT be used as current requirements.
