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
    if(data.func == "ObjectHardWorkTariffState")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectHardWorkTariffState"];
    }
    if(data.func == "ObjectHardWorkTariffState2")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectHardWorkTariffState2"];
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
    if(data.func == "FailPayments")
    {
        return ["Objects", data.FirmID, data.FirmID, "BankAccounts", data.AccountID, "FailPayments"];
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
    if(data.func == "ObjectHardWorkTariffDetails")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectHardWorkTariffDetails"];
    }
    if(data.func == "ObjectHardWorkTariffDetails2")
    {
        return ["Objects", data.FirmID, data.ObjectID, "ObjectHardWorkTariffDetails2"];
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
    
    //соглашения
    if(data.func == "PSAccordsList")
    {
        return ["Objects", data.FirmID, data.FirmID, "PSAccordsList"];
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
    if(data.func == "ObjectHardWorkTariffState")
    {
        return ["ObjectHardWorkTariffState", data.FirmID, data.ObjectID];
    }
    if(data.func == "ObjectHardWorkTariffState2")
    {
        return ["ObjectHardWorkTariffState2", data.FirmID, data.ObjectID];
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
    if(data.func == "FailPayments")
    {
        return ["FailPayments", data.AccountID];
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
    if(data.func == "ObjectHardWorkTariffDetails")
    {
        return ["ObjectHardWorkTariffDetails", data.FirmID, data.ObjectID];
    }
    if(data.func == "ObjectHardWorkTariffDetails2")
    {
        return ["ObjectHardWorkTariffDetails2", data.FirmID, data.ObjectID];
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
    
    //соглашения
    if(data.func == "PSAccordsList")
    {
        return ["PSAccordsList", data.FirmID];
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
            
        //установка начального баланса ЛС
        case "SetLSBalance":
            
            return ["SetLSBalance", data.LSID, data.value];
            
        //редактирование/создание/удаление документов
        case "LSBalanceChangeWrite":
            
            return ["LSBalanceChangeWrite", data.data];
            
        case "LSBalanceChangeDelete":
            
            return ["LSBalanceChangeDelete", data.DocumentID];
            
        case "BankPaymentWrite":
            
            return ["BankPaymentWrite", data.data];
          
            
        //загрузка платежей из банковского файла
        case "CreateBankPayment":
                        
            return ["CreateBankPayment", data.document, data.account];
        
        //поиск ЛС по номеру и адресу
        case "FindLSNumber":
            
            return ["FindLSNumber", data.FirmID, data.string];
            
        case "FindLSAdress":
            
            return ["FindLSAdress", data.FirmID, data.string];
            
        case "FindLS":
            
            return ["FindLS", data.string];
            
        //запрос баланса по расчетному счету
        case "BankAccountTurnover":
            
            return ["BankAccountTurnover", data.AccountID, data.ldate, data.rdate];
            
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
