export const KOTLIN_VIEWMODEL = `
package com.example.tcrgranite

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.flow.combine
import java.util.UUID

data class Equipment(
    val id: String = UUID.randomUUID().toString(),
    var designation: String = "",
    var price: Double = 0.0,
    var duration: Int = 0
)

data class EmployeeRole(
    val id: String = UUID.randomUUID().toString(),
    var designation: String = "",
    var count: Int = 0,
    var monthlySalary: Double = 0.0
)

data class AnnualData(
    val year: Int,
    var extractionGranite: Double = 0.0,
    var chiffreAffaires: Double = 0.0,
    var matieresFournitures: Double = 0.0,
    var services: Double = 0.0,
    var fraisPersonnel: Double = 0.0, // Injecté automatiquement
    var impotsTaxes: Double = 0.0,
    var fraisFinanciers: Double = 0.0,
    var dotationsAmortissements: Double = 0.0 // Injecté automatiquement
)

data class CalculatedData(
    val subtotal1: Double,
    val valeurAjoutee: Double,
    val subtotal2: Double,
    val resultatExploitation: Double,
    val ibm: Double,
    val resultatNet: Double,
    val fnt: Double,
    val amortissementPerTon: Double,
    val prixRevientPerTon: Double
)

class TCRViewModel : ViewModel() {
    private val _ibmRate = MutableStateFlow(0.12)
    val ibmRate = _ibmRate.asStateFlow()

    // --- Module Personnel (RH) ---
    private val _employeeRoles = MutableStateFlow<List<EmployeeRole>>(emptyList())
    val employeeRoles = _employeeRoles.asStateFlow()
    
    private val _socialChargesRate = MutableStateFlow(0.26)
    private val _salaryIncreaseRate = MutableStateFlow(0.03)

    private val _equipments = MutableStateFlow<List<Equipment>>(emptyList())
    val equipments = _equipments.asStateFlow()

    private val _rawYears = MutableStateFlow(List(10) { AnnualData(it + 1) })

    // --- LOGIQUE D'INTÉGRATION AUTOMATIQUE (Amortissements + Personnel) ---
    val years = combine(
        _rawYears, 
        _equipments, 
        _employeeRoles, 
        _socialChargesRate, 
        _salaryIncreaseRate
    ) { raw, eqs, roles, socialRate, increaseRate ->
        // 1. Calcul des Amortissements
        val annualAmortTotals = DoubleArray(10) { 0.0 }
        eqs.forEach { eq ->
            if (eq.duration > 0) {
                val annualAmort = eq.price / eq.duration
                for (i in 0 until 10) {
                    if (i + 1 <= eq.duration) annualAmortTotals[i] += annualAmort
                }
            }
        }
        
        // 2. Calcul des Frais de Personnel
        val annualHRTotals = DoubleArray(10) { 0.0 }
        val year1HR = roles.sumOf { role ->
            val base = role.count * role.monthlySalary * 12.0
            base * (1.0 + socialRate)
        }
        annualHRTotals[0] = year1HR
        for (i in 1 until 10) {
            annualHRTotals[i] = annualHRTotals[i - 1] * (1.0 + increaseRate)
        }
        
        // 3. Injection dans le TCR
        raw.mapIndexed { index, yearData ->
            yearData.copy(
                dotationsAmortissements = annualAmortTotals[index],
                fraisPersonnel = annualHRTotals[index]
            )
        }
    }

    fun addEmployeeRole(designation: String, count: Int, salary: Double) {
        _employeeRoles.update { current ->
            current + EmployeeRole(designation = designation, count = count, monthlySalary = salary)
        }
    }

    fun removeEmployeeRole(id: String) {
        _employeeRoles.update { it.filter { role -> role.id != id } }
    }

    fun setSalaryConfig(socialRate: Double, increaseRate: Double) {
        _socialChargesRate.value = socialRate
        _salaryIncreaseRate.value = increaseRate
    }

    fun addEquipment(designation: String, price: Double, duration: Int) {
        _equipments.update { current ->
            current + Equipment(designation = designation, price = price, duration = duration)
        }
    }

    fun deleteEquipment(id: String) {
        _equipments.update { it.filter { eq -> eq.id != id } }
    }

    fun updateYear(index: Int, update: (AnnualData) -> Unit) {
        _rawYears.update { current ->
            current.toMutableList().also { list ->
                val newData = list[index].copy()
                update(newData)
                list[index] = newData
            }
        }
    }

    fun calculateResults(data: AnnualData, rate: Double): CalculatedData {
        val s1 = data.matieresFournitures + data.services
        val va = data.chiffreAffaires - s1
        val s2 = data.fraisPersonnel + data.impotsTaxes + data.fraisFinanciers + data.dotationsAmortissements
        val re = va - s2
        val ibm = if (re > 0) re * rate else 0.0
        val rn = re - ibm
        val fnt = rn + data.dotationsAmortissements
        val ext = if (data.extractionGranite != 0.0) data.extractionGranite else 1.0
        return CalculatedData(s1, va, s2, re, ibm, rn, fnt, data.dotationsAmortissements / ext, (s1 + s2) / ext)
    }
}
`;

export const LAYOUT_XML = `
<!-- activity_tcr.xml -->
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fillViewport="true"
    android:scrollbars="vertical"
    android:fadeScrollbars="false"
    android:scrollbarSize="6dp"
    android:scrollbarThumbVertical="@android:color/darker_gray">

    <LinearLayout 
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Calcul Prévisionnel du TCR"
            android:textSize="22sp"
            android:textStyle="bold"
            android:textColor="#1E293B"
            android:layout_marginBottom="16dp"/>

        <TextView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Saisie des données (DA)"
            android:textStyle="italic"
            android:textColor="#64748B"
            android:layout_marginBottom="12dp"/>

        <!-- Le contenu (Listes des 10 années) sera injecté ici via RecyclerView ou LayoutInflater -->
        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/rvAnnualData"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:nestedScrollingEnabled="false" />
            
    </LinearLayout>
</ScrollView>
`;
