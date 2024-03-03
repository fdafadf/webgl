type Attribute2<TAttributesModel> = { [K in keyof TAttributesModel]: TAttributesModel[K] extends 'vec2' ? K : never; }[keyof TAttributesModel];
type Attribute3<TAttributesModel> = { [K in keyof TAttributesModel]: TAttributesModel[K] extends 'vec3' ? K : never; }[keyof TAttributesModel];

