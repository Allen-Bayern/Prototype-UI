# D-ANATOMY-REQUIREMENT-EXTENSION-0001

Anatomy v0 stabilizes only asHook-based requirements.

Other requirement forms, such as Expose, State, Event, or host capability requirements, may become useful later. They are not yet part of the stable Anatomy contract surface because their failure modes and diagnostic levels are not settled.

Resolution direction:

- Keep v0 family/profile requirements limited to asHook capability checks.
- Do not imply that Anatomy can certify arbitrary runtime behavior.
- Reopen this decision if a concrete prototype family needs a non-asHook requirement that cannot be expressed by existing contracts.
