import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Target, DollarSign, Plus, Eye } from 'lucide-react'
import './App.css'

const API_BASE = 'http://localhost:5000/api'

function App() {
  const [stats, setStats] = useState({})
  const [donations, setDonations] = useState([])
  const [rotarians, setRotarians] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDonation, setNewDonation] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    rotarian_name: '',
    notes: ''
  })
  const [newRotarian, setNewRotarian] = useState({
    name: '',
    email: '',
    target_amount: '500000'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, donationsRes, rotariansRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/donations`),
        fetch(`${API_BASE}/rotarians`)
      ])
      
      const statsData = await statsRes.json()
      const donationsData = await donationsRes.json()
      const rotariansData = await rotariansRes.json()
      
      setStats(statsData)
      setDonations(donationsData)
      setRotarians(rotariansData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDonation = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDonation),
      })
      
      if (response.ok) {
        setNewDonation({
          donor_name: '',
          donor_email: '',
          amount: '',
          rotarian_name: '',
          notes: ''
        })
        fetchData()
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du don:', error)
    }
  }

  const handleAddRotarian = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/rotarians`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRotarian),
      })
      
      if (response.ok) {
        setNewRotarian({
          name: '',
          email: '',
          target_amount: '500000'
        })
        fetchData()
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du Rotarien:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'En attente', variant: 'secondary' },
      confirmed: { label: 'Confirmé', variant: 'default' },
      cancelled: { label: 'Annulé', variant: 'destructive' }
    }
    const statusInfo = statusMap[status] || statusMap.pending
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  // Données pour les graphiques
  const rotarianChartData = rotarians.map(r => ({
    name: r.name.split(' ')[0], // Prénom seulement pour l'affichage
    collecte: r.current_amount,
    objectif: r.target_amount
  }))

  const progressData = [
    { name: 'Collecté', value: stats.total_donations || 0, color: '#22c55e' },
    { name: 'Restant', value: Math.max(0, (stats.total_target || 0) - (stats.total_donations || 0)), color: '#e5e7eb' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Suivi des Dons</h1>
              <p className="text-gray-600">Campagne de Collecte de Fonds pour la Drépanocytose</p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Nouveau Don</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau don</DialogTitle>
                    <DialogDescription>
                      Enregistrez un nouveau don collecté par un Rotarien.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddDonation} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="donor_name">Nom du donateur *</Label>
                        <Input
                          id="donor_name"
                          value={newDonation.donor_name}
                          onChange={(e) => setNewDonation({...newDonation, donor_name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="donor_email">Email du donateur</Label>
                        <Input
                          id="donor_email"
                          type="email"
                          value={newDonation.donor_email}
                          onChange={(e) => setNewDonation({...newDonation, donor_email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Montant (F CFA) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newDonation.amount}
                          onChange={(e) => setNewDonation({...newDonation, amount: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="rotarian_name">Rotarien collecteur *</Label>
                        <Select
                          value={newDonation.rotarian_name}
                          onValueChange={(value) => setNewDonation({...newDonation, rotarian_name: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un Rotarien" />
                          </SelectTrigger>
                          <SelectContent>
                            {rotarians.map((rotarian) => (
                              <SelectItem key={rotarian.id} value={rotarian.name}>
                                {rotarian.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newDonation.notes}
                        onChange={(e) => setNewDonation({...newDonation, notes: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full">Ajouter le don</Button>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Nouveau Rotarien</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau Rotarien</DialogTitle>
                    <DialogDescription>
                      Enregistrez un nouveau Rotarien avec son objectif de collecte.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddRotarian} className="space-y-4">
                    <div>
                      <Label htmlFor="rotarian_name">Nom complet *</Label>
                      <Input
                        id="rotarian_name"
                        value={newRotarian.name}
                        onChange={(e) => setNewRotarian({...newRotarian, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rotarian_email">Email</Label>
                      <Input
                        id="rotarian_email"
                        type="email"
                        value={newRotarian.email}
                        onChange={(e) => setNewRotarian({...newRotarian, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_amount">Objectif (F CFA)</Label>
                      <Input
                        id="target_amount"
                        type="number"
                        value={newRotarian.target_amount}
                        onChange={(e) => setNewRotarian({...newRotarian, target_amount: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full">Ajouter le Rotarien</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collecté</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_donations || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.progress_percentage || 0}% de l'objectif
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objectif Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_target || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Somme des objectifs individuels
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_donors || 0}</div>
              <p className="text-xs text-muted-foreground">
                Nombre total de dons
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rotariens</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_rotarians || 0}</div>
              <p className="text-xs text-muted-foreground">
                Membres actifs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barre de progression globale */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progression Globale</CardTitle>
            <CardDescription>
              Avancement vers l'objectif total de collecte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collecté: {formatCurrency(stats.total_donations || 0)}</span>
                <span>Objectif: {formatCurrency(stats.total_target || 0)}</span>
              </div>
              <Progress value={stats.progress_percentage || 0} className="h-3" />
              <p className="text-center text-sm text-muted-foreground">
                {stats.progress_percentage || 0}% de l'objectif atteint
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Onglets pour les différentes vues */}
        <Tabs defaultValue="rotarians" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rotarians">Rotariens</TabsTrigger>
            <TabsTrigger value="donations">Dons</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="rotarians">
            <Card>
              <CardHeader>
                <CardTitle>Performance des Rotariens</CardTitle>
                <CardDescription>
                  Suivi des objectifs individuels de collecte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rotarians.map((rotarian) => (
                    <div key={rotarian.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{rotarian.name}</h3>
                        <p className="text-sm text-muted-foreground">{rotarian.email}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Collecté: {formatCurrency(rotarian.current_amount)}</span>
                            <span>Objectif: {formatCurrency(rotarian.target_amount)}</span>
                          </div>
                          <Progress value={rotarian.progress_percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {rotarian.progress_percentage}% de l'objectif
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Dons</CardTitle>
                <CardDescription>
                  Liste complète des dons collectés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{donation.donor_name}</h3>
                          {getStatusBadge(donation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Collecté par: {donation.rotarian_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(donation.date_created)}
                        </p>
                        {donation.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {donation.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(donation.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition de la Collecte</CardTitle>
                  <CardDescription>
                    Progression vs objectif global
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance par Rotarien</CardTitle>
                  <CardDescription>
                    Comparaison collecte vs objectif
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rotarianChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="collecte" fill="#22c55e" name="Collecté" />
                      <Bar dataKey="objectif" fill="#e5e7eb" name="Objectif" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
