# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
import unittest
from unittest.mock import mock_open, patch
from aiconsole.core.assets.asset import AssetStatus
from aiconsole.core.settings.project_settings import Settings


class TestSettings(unittest.TestCase):

    def setUp(self):
        self.settings = Settings()

    def test_get_material_status_default(self):
        # Testing the default material status
        self.assertEqual(self.settings.get_asset_status('material1'), 'enable')

    def test_get_agent_status_default(self):
        # Testing the default agent status
        self.assertEqual(self.settings.get_agent_status('agent1'), 'enable')

    def test_set_material_status(self):
        # Testing setting the material status
        self.settings.set_material_status('material1', AssetStatus.DISABLED)
        self.assertEqual(self.settings.get_asset_status('material1'), AssetStatus.DISABLED)

    def test_set_agent_status(self):
        # Testing setting the agent status
        self.settings.set_agent_status('agent1', AssetStatus.FORCED)
        self.assertEqual(self.settings.get_agent_status('agent1'), AssetStatus.FORCED)

    @patch("builtins.open", new_callable=mock_open)
    def test_load_empty_settings_file(self, mock_file_open):
        # Testing loading an empty settings file
        mock_file_open.return_value.read.return_value = ""
        with patch('builtins.open', mock_file_open):
            settings = Settings()
        self.assertEqual(settings.get_asset_status('material1'), 'enable')
        self.assertEqual(settings.get_agent_status('agent1'), 'enable')

    @patch("builtins.open", new_callable=mock_open)
    def test_create_empty_settings_file(self, mock_file_open):
        # Testing creating an empty settings file when it doesn't exist
        mock_file_open.side_effect = FileNotFoundError
        with patch('builtins.open', mock_file_open):
            settings = Settings()
        self.assertEqual(settings.get_asset_status('material1'), 'enable')
        self.assertEqual(settings.get_agent_status('agent1'), 'enable')

    @patch("builtins.open", new_callable=mock_open)
    def test_load_existing_settings_file(self, mock_file_open):
        # Testing loading an existing settings file
        toml_data = ""\"
        [materials]
        material1 = "disable"
        [agents]
        agent1 = "force"
        ""\"
        mock_file_open.return_value.read.return_value = toml_data
        with patch('builtins.open', mock_file_open):
            settings = Settings()
        self.assertEqual(settings.get_asset_status('material1'), 'disable')
        self.assertEqual(settings.get_agent_status('agent1'), 'force')

    @patch("builtins.open", new_callable=mock_open)
    def test_save_settings(self, mock_file_open):
        # Testing saving settings to a file
        settings = Settings()
        settings.set_material_status('material1', AssetStatus.DISABLED)
        settings.set_agent_status('agent1', AssetStatus.FORCED)
        with patch('builtins.open', mock_file_open) as m:
            settings.__save_toml_data()
            m.assert_called_with(settings.__file_path, 'w')
            m().write.assert_called_once()

"""
