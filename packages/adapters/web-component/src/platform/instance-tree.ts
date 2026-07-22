import { createInstanceTreeMarkers } from '@proto.ui/adapter-base';

export const {
  PROTO_INSTANCE: __WC_PROTO_INSTANCE,
  createLogicalInstance,
  markProtoInstance,
  unbindProtoInstance,
  setProtoParent,
  getProtoParent,
  getPrototypeByInstance,
  getLogicalParent,
  getLogicalRoot,
  getLogicalPrototype,
  setLogicalEventRouteOwner,
  getLogicalEventRouteOwner,
  getLogicalEventTarget,
  bindLogicalEventTarget,
  unbindLogicalEventTarget,
} = createInstanceTreeMarkers('@proto.ui/adapter-web-component/__proto_instance');
