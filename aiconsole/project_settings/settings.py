import tomlkit
from pathlib import Path
from aiconsole.materials.material import MaterialStatus
from typing import Dict


class Settings:
    def __init__(self) -> None:
        self.__file_path: Path = Path('./settings.toml')
        self.__toml_data = self.__load_toml_data()
        self.__materials: Dict[str, str] = self.__load_section('materials')
        self.__agents: Dict[str, str] = self.__load_section('agents')

    def __load_toml_data(self) -> tomlkit.document:
        if not self.__file_path.exists():
            self.__create_empty_file()
        with self.__file_path.open() as file:
            return tomlkit.loads(file.read())

    def __create_empty_file(self) -> None:
        doc = tomlkit.document()
        doc['materials'] = tomlkit.table()
        doc['agents'] = tomlkit.table()
        with self.__file_path.open('w') as file:
            file.write(doc.as_string())

    def __load_section(self, section_name: str) -> Dict[str, MaterialStatus]:
        try:
            section = self.__toml_data[section_name]
        except tomlkit.exceptions.NonExistentKey:
            return {}
        return {key: MaterialStatus(section[key]) for key in section.keys()}

    def __save_toml_data(self) -> None:
        # Przygotuj dane materials i agents w formacie do zapisu w obiekcie TOML
        materials_table = tomlkit.table()
        agents_table = tomlkit.table()

        for key, value in self.__materials.items():
            materials_table[key] = tomlkit.string(value)

        for key, value in self.__agents.items():
            agents_table[key] = tomlkit.string(value)

        # Aktualizuj sekcje 'materials' i 'agents' w obiekcie toml_data
        self.__toml_data["materials"] = materials_table
        self.__toml_data["agents"] = agents_table

        # Zapisz zmieniony obiekt toml_data do pliku TOML
        with self.__file_path.open('w') as file:
            file.write(self.__toml_data.as_string())


    def get_material_status(self, material_id: str) -> MaterialStatus:
        return MaterialStatus(self.__materials.get(material_id, MaterialStatus.ENABLED.value))

    def get_agent_status(self, agent_id: str) -> MaterialStatus:
        return MaterialStatus(self.__agents.get(agent_id, MaterialStatus.ENABLED.value))

    def set_material_status(self, material_id: str, status: MaterialStatus) -> None:
        self.__materials[material_id] = status.value
        self.__save_toml_data()

    def set_agent_status(self, agent_id: str, status: MaterialStatus) -> None:
        self.__agents[agent_id] = status.value
        self.__save_toml_data()
