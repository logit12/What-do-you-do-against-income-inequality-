import pandas as pd
import numpy as np
from os import walk
from sklearn.preprocessing import MinMaxScaler

path_eco = './analyse_data/Indicators_eco/'
path_work = './analyse_data/Indicators_work/'
path_edu = './analyse_data/Indicators_education/'
file_world = './analyse_data/details_countries.csv'
path = [path_eco, path_edu, path_work]

df_world = pd.read_csv('./analyse_data/details_countries.csv')
# df_treaties = pd.read_csv('./analyse_data/World_Treaties.csv')
# df_aids = pd.read_excel('./analyse_data/Indicators_eco/Aid received.xlsx', sheetname='Data')

df_agg = pd.read_csv('./data/data_agg/scaled_indicators.csv')
df_gini = pd.read_excel('./analyse_data/gini_firstAnalyse.xlsx', sheetname='gini')
df_giniAdd = pd.read_excel('./data/Gini_add/allginis_2013.xls', sheetname='data')
df_giniGap = pd.read_excel('./data/Gini_add/indicator_SI_POV_GINI.xlsx', sheetname='Data')

# Traitement pour le premier fichier Gini
del df_gini[1978] # pas d'indice de gini et valeurs incohérentes
df_gini['indicator'] = 'gini'
df_gini['indicator2'] = df_gini.columns.tolist()[0]
df_gini['name'] = df_gini[df_gini.columns.tolist()[0]]
del df_gini[df_gini.columns.tolist()[0]]
df_gini = pd.melt(df_gini, id_vars=['name', 'indicator', 'indicator2'],
                            value_vars=list(df_gini.columns[:-3]),
                            var_name='year', value_name='value')

# 82 lignes sans valeurs (pays + indicateurs)
lg = df_gini[['name','value']].groupby('name').count()
paysToDrop = lg[lg.value == 0].index.tolist()
df_gini = df_gini[(df_gini.name.apply(lambda x: x not in paysToDrop))]
df_gini = df_gini.drop_duplicates()

# 19760 - 2010

# Traitement pour le fichier Gini de Gapminder
df_giniGap['indicator'] = 'gini'
df_giniGap['indicator2'] = df_giniGap.columns.tolist()[0]
df_giniGap['name'] = df_giniGap[df_giniGap.columns.tolist()[0]]
del df_giniGap[df_giniGap.columns.tolist()[0]]
df_giniGap = pd.melt(df_giniGap, id_vars=['name', 'indicator', 'indicator2'],
                            value_vars=list(df_giniGap.columns[:-3]),
                            var_name='year', value_name='value')

# Traitement du fichier Gini provenant de WorldBank
df_giniAdd['name'] = df_giniAdd.country
df_giniAdd = df_giniAdd[['name','year','Giniall']]
df_giniAdd['indicator'] = 'gini'

# Merge des deux premiers fichiers
gini_merged_tmp = pd.merge(df_gini, df_giniAdd, how='outer', on=['name', 'year'])
gini_merged_tmp['value'] = gini_merged_tmp.value.combine_first(gini_merged_tmp.Giniall)
gini_merged_tmp['indicator'] = gini_merged_tmp.indicator_x.combine_first(gini_merged_tmp.indicator_y)
gini_merged_tmp['indicator2'] = list(set(gini_merged_tmp['indicator2'].dropna().values))[0]
gini_merged_tmp = gini_merged_tmp[['name','year','indicator','indicator2','value']]

# Merge avec le dernier fichier
gini_merged = pd.merge(gini_merged_tmp, df_giniGap, how='outer', on=['name', 'year'])
gini_merged['value'] = gini_merged.value_x.combine_first(gini_merged.value_y)
gini_merged['indicator'] = list(set(gini_merged['indicator_x'].dropna().values))[0]
gini_merged['indicator2'] = list(set(gini_merged['indicator2_x'].dropna().values))[0]
gini_merged = gini_merged[['name', 'indicator', 'indicator2', 'year', 'value']]
gini_merged['year'] = gini_merged.year.astype(int).astype(str)

gini_merged = pd.merge(gini_merged, df_world[['name','region']], how='left', on='name')

gini_merged.to_csv('./data/data_agg/gini_full.csv')

# =============================================================================

file_merged = pd.DataFrame()
for _path in path:
    for filename in next(walk(_path))[2]:
        file_tmp = pd.read_excel(_path + filename, sheetname='Data')
        file_tmp['indicator'] = filename.replace('.xlsx', '')
        file_tmp['indicator2'] = file_tmp.columns.tolist()[0]
        file_tmp['name'] = file_tmp[file_tmp.columns.tolist()[0]]
        del file_tmp[file_tmp.columns.tolist()[0]]

        file_tmp = pd.melt(file_tmp, id_vars=['name', 'indicator', 'indicator2'],
                                    value_vars=list(file_tmp.columns[:-3]),
                                    var_name='year', value_name='value')
        file_merged = pd.concat([file_merged, file_tmp])

file_merged = pd.merge(file_merged, df_world[['name','region']], on='name')
file_merged['predicted'] = False

file_merged.to_csv('ind_merged.csv')
#liste_edu = ['Completition rate female.xlsx', 'Completition rate male.xlsx', 'Completition rate total.xlsx', 'expenditure primary.xlsx', 'expenditure secondary.xlsx', 'expenditure tertiery.xlsx', 'indicator SE_ENR_PRSC_FM_ZS.xls.xlsx', 'Years in school men 25 plus.xlsx', 'Years in school women 25 plus.xlsx']


scaler = MinMaxScaler()

df_test = scaler.fit_transform(gini_merged[['name', 'indicator', 'indicator2', 'year', 'value']])
