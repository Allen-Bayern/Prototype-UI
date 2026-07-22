import { createInstanceTreeMarkers } from '@proto.ui/adapter-base';

export const {
  PROTO_INSTANCE: __REACT_PROTO_INSTANCE,
  createLogicalInstance,
  bindLogicalParent,
  markProtoInstance,
  unbindProtoInstance,
  setProtoParent,
  clearProtoParentProjection,
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
} = createInstanceTreeMarkers('@proto.ui/adapter-react/__proto_instance');
