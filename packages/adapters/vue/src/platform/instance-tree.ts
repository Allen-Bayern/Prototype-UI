import { createInstanceTreeMarkers } from '@proto.ui/adapter-base';

export const {
  PROTO_INSTANCE: __VUE_PROTO_INSTANCE,
  createLogicalInstance,
  markProtoInstance,
  unbindProtoInstance,
  setProtoParent,
  getProtoParent,
  getPrototypeByInstance,
  getLogicalParent,
  getLogicalRoot,
  getLogicalPrototype,
} = createInstanceTreeMarkers('@proto.ui/adapter-vue/__proto_instance');
