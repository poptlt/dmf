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
    if(data.func == "ObjectTariffTOState")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectTariffTOState"];
    }
    if(data.func == "ObjectHardState")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectHardState"];
    }
    if(data.func == "GetLSTurnover")
    {
        return ["Objects", data.FirmID, data.LSID, "GetLSTurnover", data.year];
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
    if(data.func == "ObjectHardDetails")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectHardDetails"];
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
    if(data.func == "ObjectTariffTOState")
    {
        return ["ObjectTariffTOState", data.FirmID, data.ObjectID];
    }
    if(data.func == "ObjectHardState")
    {
        return ["ObjectHardState", data.FirmID, data.ObjectID];
    }
    if(data.func == "GetLSTurnover")
    {
        return ["GetLSTurnover", data.LSID, data.year];
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
    if(data.func == "ObjectHardDetails")
    {
        return ["ObjectHardDetails", data.FirmID, data.ObjectID];
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
    
    //изменение истории
    switch(data.func)
    {
        //изменение имени тарифа/добавление нового
        case "TariffWrite":
            
            return ["TariffWrite", data.FirmID, data.TariffID, data.TariffName];
            
        case "TariffDelete":
            
            return ["TariffDelete", data.FirmID, data.TariffID];
            
        case "TariffTOWrite":
            
            return ["TariffTOWrite", data.FirmID, data.TariffID, data.TariffName];
            
        case "TariffTODelete":
            
            return ["TariffTODelete", data.FirmID, data.TariffID];
        
        //изменение значения тарифа(добавление/удаление записи в историю значений)
        case "TariffValueWrite":
            
            return ["TariffValueWrite", data.FirmID, data.AttrID, data.date, data.value];
            
        case "TariffValueDelete":
            
            return ["TariffValueDelete", data.FirmID, data.AttrID, data.date];
            
        case "TariffTOValueWrite":
            
            return ["TariffTOValueWrite", data.FirmID, data.TariffID, data.date, data.value];
            
        case "TariffTOValueDelete":
            
            return ["TariffTOValueDelete", data.FirmID, data.TariffID, data.date];
        
        //изменение значения реквизита(добавление/удаление записи в историю значений)
        case "ObjectPropWrite":
            
            return ["ObjectPropWrite", data.ObjectID, data.FirmID, data.AttrID, data.date, data.value];
            
        case "ObjectPropDelete":
            
            return ["ObjectPropDelete", data.ObjectID, data.FirmID, data.AttrID, data.date];
        
        //изменение значения параметра расчета(добавление/удаление записи в историю значений)
        case "CalcParamWrite":
            
            return ["CalcParamWrite", data.ObjectID, data.FirmID, data.AttrID, data.date, data.value];
            
        case "CalcParamDelete":
            
            return ["CalcParamDelete", data.ObjectID, data.FirmID, data.AttrID, data.date];
            
            
            
        case "ObjectTariffTOWrite":
            
            return ["ObjectTariffTOWrite", data.FirmID, data.ObjectID, data.date, data.value];
        
        case "ObjectTariffTODelete":
            
            return ["ObjectTariffTODelete", data.FirmID, data.ObjectID, data.date, data.value];
            
        case "ObjectHardWrite":
            
            return ["ObjectHardWrite", data.FirmID, data.ObjectID, data.date, data.kitID, data.equipmentID];
            
        case "ObjectHardDelete":
            
            return ["ObjectHardDelete", data.FirmID, data.ObjectID, data.date, data.kitID];
            
        case "ObjectHardWorkWrite":
            
            return ["ObjectHardWorkWrite", data.FirmID, data.ObjectID, data.date, data.kitID, data.state];
            
        case "ObjectHardWorkDelete":
            
            return ["ObjectHardWorkDelete", data.FirmID, data.ObjectID, data.date, data.kitID];
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
