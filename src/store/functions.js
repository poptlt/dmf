export function getPath(data)//куда класть данные во vuex
{
    //дети в дереве
    if(data.func == "TreeLevel")
    {
        let res = ["Objects"];

        if(data.FirmID) res.push(data.FirmID);
        if(data.ObjectID) res.push(data.ObjectID);

        res.push("TreeLevel");

        return res;
    }

    //лицевые счета
    if(data.func == "LSList")
    {
        return ["Objects", data.FirmID, data.ObjectID, "LSList"];
    }

    //инфа по объекту
    if(data.func == "GetObjectProps")
    {
        return ["Objects", data.FirmID, data.ObjectID, "GetObjectProps"];
    }
    if(data.func == "GetObjectCalcParams")
    {
        return ["Objects", data.FirmID, data.ObjectID, "GetObjectCalcParams"];
    }
    if(data.func == "GetTariffs")
    {
        return ["Objects", data.FirmID, data.FirmID, "GetTariffs"];
    }
    if(data.func == "GetTariffsTO")
    {
        return ["Objects", data.FirmID, data.FirmID, "GetTariffsTO"];
    }
    if(data.func == "GetBankAccounts")
    {
        return ["Objects", data.FirmID, data.FirmID, "GetBankAccounts"];
    }

    //изменения в параметрах дочерних
    if(data.func == "GetChildrenHistoryCalcParams")
    {
        return ["Objects", data.FirmID, data.ObjectID, "GetChildrenHistoryCalcParams"];
    }

    //история изменений
    if(data.func == "ObjectPropDetails")
    {
        return ["Objects", data.FirmID, data.ObjectID, "Props", data.AttrID, "ObjectPropDetails"];
    }
    if(data.func == "CalcParamDetails")
    {
        return ["Objects", data.FirmID, data.ObjectID, "CalcParams", data.AttrID, "CalcParamDetails"];
    }
    if(data.func == "TariffValueDetails")
    {
        return ["Objects", data.FirmID, data.ObjectID, "Tariffs", data.AttrID, "TariffValueDetails"];
    }
    if(data.func == "TariffTOValueDetails")
    {
        return ["Objects", data.FirmID, data.FirmID, "TariffsTO", data.TariffID, "TariffTOValueDetails"];
    }
    if(data.func == "ObjectTariffTODetails")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectTariffTODetails"];
    }

    //типы
    if(data.func == "GetHardTypes")
    {
        return ["HardTypes"];
    }
    if(data.func == "DataTypes")
    {
        return ["Objects", data.FirmID, "DataTypes"];
    }

    //документ
    if(data.func == "GetDoc")
    {
        return ["Objects", data.FirmID, data.FirmID, "Documents", data.DocumentID, "GetDoc"];
    }
}

export function getQuery(data)//что спрашивать у сервера
{
    //дети в дереве
    if(data.func == "TreeLevel")
    {
        return ["TreeLevel", data.FirmID, data.ObjectID];
    }

    //лицевые счета
    if(data.func == "LSList")
    {
        return ["LSList", data.ObjectID, data.FirmID];
    }

    //инфа по объекту
    if(data.func == "GetObjectProps")
    {
        return ["GetObjectProps", data.FirmID, data.ObjectID];
    }
    if(data.func == "GetObjectCalcParams")
    {
        return ["GetObjectCalcParams", data.FirmID, data.ObjectID];
    }
    if(data.func == "GetTariffs")
    {
        return ["GetTariffs", data.FirmID];
    }
    if(data.func == "GetTariffsTO")
    {
        return ["GetTariffsTO", data.FirmID];
    }
    if(data.func == "GetBankAccounts")
    {
        return ["GetBankAccounts", data.FirmID];
    }

    //изменения в параметрах дочерних
    if(data.func == "GetChildrenHistoryCalcParams")
    {
        return ['GetChildrenHistoryCalcParams', data.ObjectID, data.FirmID];
    }

    //история изменений
    if(data.func == "ObjectPropDetails")
    {
        return ['ObjectPropDetails', data.ObjectID, data.FirmID, data.AttrID];
    }
    if(data.func == "CalcParamDetails")
    {
        return ['CalcParamDetails', data.ObjectID, data.FirmID, data.AttrID];
    }
    if(data.func == "TariffValueDetails")
    {
        return ['TariffValueDetails', data.FirmID, data.AttrID];
    }
    if(data.func == "TariffTOValueDetails")
    {
        return ["TariffTOValueDetails", data.FirmID, data.TariffID];
    }
    if(data.func == "ObjectTariffTODetails")
    {
        return ["ObjectTariffTODetails", data.FirmID, data.ObjectID];
    }

    //типы
    if(data.func == "GetHardTypes")
    {
        return ["GetHardTypes"];
    }
    if(data.func == "DataTypes")
    {
        return ['DataTypes', data.FirmID];
    }

    //документ
    if(data.func == "GetDoc")
    {
        return ['GetDoc', data.DocumentID];
    }
}

export function getData(path, state)
{
    let root = state;

    path.forEach((key) => {

        if(root === null || typeof root != "object") return undefined;

        root = root[key];
    })

    return root;
}