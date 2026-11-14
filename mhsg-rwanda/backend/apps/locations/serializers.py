from rest_framework import serializers
from .models import RwandaProvince, RwandaDistrict, RwandaSector, RwandaCell, RwandaVillage

class RwandaVillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RwandaVillage
        fields = ["id", "name"]

class RwandaCellSerializer(serializers.ModelSerializer):
    class Meta:
        model = RwandaCell
        fields = ["id", "name"]

class RwandaSectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RwandaSector
        fields = ["id", "name", "district"]

class RwandaDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = RwandaDistrict
        fields = ["id", "name", "code", "province"]

class RwandaProvinceSerializer(serializers.ModelSerializer):
    districts = RwandaDistrictSerializer(many=True, read_only=True)

    class Meta:
        model = RwandaProvince
        fields = ["id", "name", "code", "districts"]
