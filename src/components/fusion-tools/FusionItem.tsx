import { Select, Button } from "antd";
import { ITarot } from "@/types/tarot";
import { CUSTOM_ARCANA_LIST } from "@/constant/tarot";
import { DeleteOutlined } from "@ant-design/icons";

interface FusionItemProps {
  material: ITarot;
  arcanaTypes: string[];
  onMaterialChange: (material: ITarot) => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export default function FusionItem({
  material,
  arcanaTypes,
  onMaterialChange,
  onDelete,
  showDelete = true,
}: FusionItemProps) {
  return (
    <div className="flex gap-2 items-center mb-2">
      <Select
        placeholder="请选择塔罗牌类型"
        value={material?.typeName}
        onChange={(type) => {
          onMaterialChange({
            ...material,
            typeName: type,
            name: "",
          });
        }}
        options={arcanaTypes.map((type) => ({
          label: type,
          value: type,
        }))}
        className="flex-1"
      />
      <Select
        placeholder="请选择具体 Persona"
        value={material.name}
        onChange={(selected) => {
          onMaterialChange({
            ...material,
            name: selected,
            level: CUSTOM_ARCANA_LIST.get(material.typeName)!.find(
              (arcana) => arcana.name === selected
            )!.level,
          });
        }}
        options={
          material.typeName
            ? CUSTOM_ARCANA_LIST.get(material.typeName)?.map((item) => ({
                label: `${item.name} (Lv.${item.level})`,
                value: item.name,
              }))
            : []
        }
        disabled={!material.typeName}
        showSearch
        className="flex-1"
      />
      {showDelete && onDelete && (
        <Button
          type="default"
          onClick={onDelete}
          className="w-24"
          icon={<DeleteOutlined />}
        />
      )}
    </div>
  );
}
